const axios = require("axios");
const prisma = require("../../prisma/prismaClient");
const { themeCategoryMap, regionCenterCoords } = require("../config/kakaoConfig");
const shortUUID = require("short-uuid");

//1. 여행 생성 서비스
async function createTripService(user_id, tripData) {
  try {
    const { destinations, startDate, endDate, theme, companionType } = tripData;

    const tripId = shortUUID.generate(); //여행 고유 ID 생성
    let title = `${Array.isArray(destinations) ? destinations.join("-") : destinations} 여행`; //title 자동생성

    //한국 시간 기준으로 날짜 계산
    const toKSTDate = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + 9 * 60 * 60 * 1000);
    };
    const start = toKSTDate(startDate);
    start.setDate(start.getDate() + 1);
    const end = toKSTDate(endDate);

    //여행 정보 DB 저장
    const newTrip = await prisma.trip.create({
      data: {
        trip_id: tripId,
        user_id,
        title,
        destinations,
        start_date: start,
        end_date: end,
        theme,
        companion_type: companionType,
        is_shared: "PRIVATE",
      }
    });

    //일차 수 자동 계산
    const dayList = [];
    let index = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const cloned = new Date(d);
      dayList.push({
        date: cloned,
        trip_id: tripId,
        day_order: index++,
      });
    }
    //전체 일차 DB저장
    await prisma.day.createMany({ data: dayList });

    return newTrip;
  } catch (error) {
    console.error("createTripService 중 오류 발생:", error);
    throw error;
  }
}

//2. 여행 정보 조회 서비스
async function getTripIdService(trip_id) {
  try {
    //trip_id로 Trip 테이블 조회
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
      include: {
        days: {
          orderBy: { day_order: 'asc' },
          include: {
            places: {
              include: { place: true },
              orderBy: { dayplace_order: 'asc' }
            }
          }
        }
      },
    });

    return trip;
  } catch (error) {
    console.error("getTripIdService 중 오류:", error);
    throw error;
  }
}

//3. 특정 Day에 장소 추가 서비스
async function addPlaceToDayService(day_id, placeData) {
  const { kakao_place_id, place_name, place_address, place_latitude, place_longitude, place_image_url, place_star, place_call_num } = placeData;

  const numbericDayId = Number(day_id); //day_id를 숫자로 변환

  //여기서 kakao_place_id는 외부 카카오맵 api에서 받아오는 고유 id이고
  //place_id는 각 메서드에서 사용될 id
  //kakao_place_id와 place_id는 다름

  // 1. kakao_place_id 중복체크
  let place = await prisma.place.findUnique({
    where: { kakao_place_id },
  });

  //2.없으면 새로 등록
  if (!place) { //kakao_place_id가 없다면 생성 - 후에 카카오 api랑 연결할때 추가
    place = await prisma.place.create({
      data: {
        kakao_place_id,
        place_name,
        place_address,
        place_latitude,
        place_longitude,
        place_image_url,
        place_star,
        place_call_num
      }
    });
  }

  //3. 해당 날짜 마지막 order 확인 후 뒤에 새로운 장소 저장
  const maxOrder = await prisma.dayPlace.aggregate({
    where: { day_id: numbericDayId },
    _max: { dayplace_order: true },
  });
  const nextOrder = (maxOrder._max.dayplace_order || 0) + 1;

  // 4. 새로운 장소 정보를 dayPlace 테이블에 저장
  const dayPlace = await prisma.dayPlace.create({
    data: {
      day_id: numbericDayId,
      place_id: place.place_id,
      dayplace_order: nextOrder,
    },
  });

  return { place, dayPlace };
}

//4. 장소 순서 변경 서비스
// previous : 장소가 있었던 위치, present: 이 장소를 옮기고 싶은 위치
async function reorderPlaceService(previous, present) {
  const { dayplace_id } = previous;
  const { day_id: newDayId, dayplace_order: newOrder } = present;

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.dayPlace.findUnique({
      where: { dayplace_id },
    });

    if (!existing) throw new Error(`${dayplace_id}가 존재하지 않음`);

    // 1. 뒤에 있는 장소들 순서 앞으로 당김
    await tx.dayPlace.updateMany({
      where: {
        day_id: existing.day_id,
        dayplace_order: { gt: existing.dayplace_order },
      },
      data: {
        dayplace_order: { decrement: 1 },
      },
    });

    // 2. 새로운 위치에서 뒤에 있는 장소들 순서 뒤로 밀어줌
    await tx.dayPlace.updateMany({
      where: {
        day_id: newDayId,
        dayplace_order: { gte: newOrder },
      },
      data: {
        dayplace_order: { increment: 1 },
      },
    });

    // 3. 새로운 dayid와 dayplace_order를 DB에 업데이트함
    const updated = await tx.dayPlace.update({
      where: { dayplace_id },
      data: {
        day_id: newDayId,
        dayplace_order: newOrder,
      },
    });

    return updated;
  });
}

//5. 날짜 순서 변경 서비스
async function reorderDayService(trip_id, previous, present) {
  const days = await prisma.day.findMany({
    where: { trip_id },
    orderBy: { day_order: 'asc' },
  });

  // 1. reordered 배열에 날짜끼리 순서 변경한거 저장
  const movingDay = days[previous];
  const reordered = [...days]; //기존 days 배열 복사
  reordered.splice(previous, 1); //previous 위치의 day 1개 제거
  reordered.splice(present, 0, movingDay); //present 위치의 movingDay 삽입

  // 2. 트랜잭션으로 순서 업데이트 처리리
  return await prisma.$transaction(async (tx) => {
    const updates = reordered.map((day, index) =>
      tx.day.update({
        where: { day_id: day.day_id },
        data: { day_order: index + 1 },
      })
    );
    //3. 병렬로 한번에 실행
    await Promise.all(updates);
  });
}

//6. day별 장소 삭제 서비스
async function deletePlaceService(dayplace_id) {
  return await prisma.$transaction(async (tx) => {
    const target = await tx.dayPlace.findUnique({
      where: { dayplace_id },
    });

    if (!target) {
      throw new Error("해당 Day에 지정된 장소가 없습니다.");
    }

    // 1. 해당 dayPlace 삭제
    await tx.dayPlace.delete({
      where: { dayplace_id },
    });

    // 3. 그 뒤의 order 조정
    await tx.dayPlace.updateMany({
      where: {
        day_id: target.day_id,
        dayplace_order: { gt: target.dayplace_order, },
      },
      data: {
        dayplace_order: { decrement: 1, },
      },
    });
  });
}

//7.저장된 여행 일정 불러오기 서비스
async function getMyTripsService(user_id) {
  return await prisma.trip.findMany({
    where: { user_id },
    orderBy: { start_date: "desc" },
  });
}

// 8. 여행삭제 서비스
async function deleteTripService(trip_id) {
  return await prisma.$transaction(async (tx) => {
    const days = await tx.day.findMany({
      where: { trip_id },
      select: { day_id: true },
    });

    const dayIds = days.map((d) => d.day_id);

    // 1. DayPlace 삭제
    await tx.dayPlace.deleteMany({
      where: { day_id: { in: dayIds } },
    });

    // 2. Expense 삭제
    await tx.expense.deleteMany({
      where: { day_id: { in: dayIds } },
    });

    // 3. Day 삭제
    await tx.day.deleteMany({
      where: { trip_id },
    });

    // 4. Trip 삭제
    return await tx.trip.delete({
      where: { trip_id },
    });
  }
  )
}

// 9. AI 여행 일정 생성 서비스
async function generateDaysService(trip_id) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
    });

    if (!trip) throw new Error("Trip data 없음");

    const { destinations, theme, start_date, end_date } = trip;

    // Step 1: 일정 일수 계산
    const dayList = [];
    const start = new Date(start_date);
    const end = new Date(end_date);
    let index = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const cloned = new Date(d);
      dayList.push({
        trip_id,
        date: new Date(cloned),
        day_order: index++,
      });
    }

    // Step 2: Kakao API 장소 검색 (카테고리 기반)
    const recommendedPlaces = [];
    const kakaoKey = process.env.KAKAO_REST_API_KEY;

    for (const region of destinations) {
      const center = regionCenterCoords[region];
      if (!center) {
        console.warn(`지역 좌표 없음: ${region}`);
        continue;
      }



      for (const t of theme) {
        const categoryCodes = themeCategoryMap[t] || [];

        for (const code of categoryCodes) {

          const res = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
            params: {
              query: region, // ex) "인천"
              category_group_code: code, //  "FD6", "CE7", "CS2", "SC4" 등
              size: 10,
            },
            headers: {
              Authorization: `KakaoAK ${kakaoKey}`,
            },
          });

          recommendedPlaces.push(...res.data.documents);
        }
      }
    }

    // Step 3: Place 생성 (중복 체크)
    const createdDays = [];
    for (let i = 0; i < dayList.length; i++) {
      const placesForDay = recommendedPlaces.slice(i * 3, (i + 1) * 3);
      const dayData = await prisma.day.create({ data: dayList[i], });


      let order = 1;
      for (const place of placesForDay) {
        const existingPlace = await prisma.place.upsert({
          where: { kakao_place_id: place.id },
          update: {},
          create: {
            kakao_place_id: place.id,
            place_name: place.place_name,
            place_address: place.road_address_name,
            place_latitude: parseFloat(place.y),
            place_longitude: parseFloat(place.x),
            place_image_url: "", // 이미지 추후 설정 가능
            place_star: null,
            place_call_num: place.phone || null,
          },
        });


        await prisma.dayPlace.create({
          data: {
            day_id: dayData.day_id,
            place_id: existingPlace.place_id,
            dayplace_order: order++,
          },
        });
      }

      createdDays.push(dayData);
    }

    return createdDays;
  } catch (err) {
    console.error("generateDaysService 오류:", err);
    throw err;
  }
}

module.exports = { createTripService, getTripIdService, addPlaceToDayService, reorderPlaceService, reorderDayService, deletePlaceService, getMyTripsService, deleteTripService, generateDaysService };
