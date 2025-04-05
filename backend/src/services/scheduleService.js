const prisma = require("../../prisma/prismaClient");
const shortUUID = require("short-uuid");

//1. 여행 추가 서비스
async function createTripService(user_id, tripData) {
    try {
        const {destinations, startDate,endDate, theme, companionType} = tripData;

        const tripId = shortUUID.generate();
        let title = `${Array.isArray(destinations) ? destinations.join("-") : destinations} 여행`;

        //한국 시간 기준으로 날짜 계산
        const toKSTDate = (dateStr) => {
          const [year, month, day] = dateStr.split("-").map(Number);
          return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + 9 * 60 * 60 * 1000);
        };
        const start = toKSTDate(startDate);
        start.setDate(start.getDate() + 1);
        const end = toKSTDate(endDate);

        //새로운 여행 생성
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

        //일차 수 자동 생성
        const dayList = [];
        let index =1;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const cloned = new Date(d);
          dayList.push({
            date: cloned,
            trip_id: tripId,
            day_order: index++,
          });
        }
        await prisma.day.createMany({ data: dayList });

        return newTrip;
    } catch (error) {
        console.error("createTripService 중 오류 발생:", error);
        throw error;
    }
}

//2. tripId로 여행정보 접근 서비스
async function getTripIdService(trip_id) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { trip_id },
        include: {
          days: {
            orderBy: { day_order: 'asc'},
            include: {
              places: {
                include: {
                  place: true,
                },
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

//3. Day별 장소 추가 서비스
async function addPlaceToDayService(day_id,placeData){
  const {kakao_place_id, place_name, place_address, place_latitude, place_longitude, place_image_url, place_star, place_call_num} = placeData;

  const numbericDayId = Number(day_id);

  // 1. kakao_place_id 중복체크
  let place = await prisma.place.findUnique({
    where: {kakao_place_id},
  });

  //2.없으면 새로등록
  if(!place){ //kakao_place_id가 없다면 생성 - 후에 카카오 api랑 연결할때 추가
    place = await prisma.place.create({
      data:{
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

    //3. 해당날짜 마지막 order확인
    const maxOrder = await prisma.dayPlace.aggregate({
      where: { day_id: numbericDayId },
      _max: { dayplace_order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    // 4. dayPlace 추가
  const dayPlace = await prisma.dayPlace.create({
    data: {
      day_id: numbericDayId,
      place_id: place.place_id,
      dayplace_order: nextOrder,
    },
  });

    return {place, dayPlace};
}

//4. 장소 순서 변경 서비스
// previous : 장소가 있었던 위치, present: 이 장소를 옮기고 싶은 위치
async function reorderPlaceService(previous,present){
  const {dayplace_id} = previous;
  const {day_id : newDayId, dayplace_order: newOrder } = present;

  if (!dayplace_id) throw new Error("dayPlace_id가 없습니다");

  return await prisma.$transaction(async (tx)=>{
    const existing = await tx.dayPlace.findUnique({
      where: { dayplace_id },
    });
  
    if (!existing) throw new Error(`dayPlace_id ${dayplace_id}가 존재하지 않습니다`);
    

    // 1. 현재 위치에서 order 조정 (order 채우기)
    await tx.dayPlace.updateMany({
      where: {
        day_id: existing.day_id,
        dayplace_order: { gt: existing.dayplace_order },
      },
      data: {
        dayplace_order: { decrement: 1 },
      },
    });

    // 2. 새 위치에서 order 밀어주기
    await tx.dayPlace.updateMany({
      where: {
        day_id: newDayId,
        dayplace_order: { gte: newOrder },
      },
      data: {
        dayplace_order: { increment: 1 },
      },
    });

    // 3. 실제 이동
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
    where: {trip_id},
    orderBy: { day_order :'asc'},
  });

  const movingDay = days[previous];
  const reordered = [...days];
  reordered.splice(previous,1);
  reordered.splice(present,0,movingDay);

  return await prisma.$transaction(async (tx) => {
    const updates = reordered.map((day,index) => 
      tx.day.update({
        where: {day_id : day.day_id},
        data: {day_order: index +1},
      })
    );
    await Promise.all(updates);
  });
}

//6. day별 장소 삭제 서비스
async function deletePlaceFromDayService(dayplace_id) {
  return await prisma.$transaction(async (tx) => {
    // 1. 삭제할 dayPlace의 order 찾기 
    const target = await tx.dayPlace.findUnique({
      where: { dayplace_id },
    });

    if (!target) {
      throw new Error("해당 Day에 지정된 장소가 없습니다.");
    }

    // 2. 해당 dayPlace 삭제
    await tx.dayPlace.delete({
      where: { dayplace_id },
    });

    // 3. 그 뒤의 order 조정
    await tx.dayPlace.updateMany({
      where: {
        day_id: target.day_id,
        dayplace_order: {
          gt: target.dayplace_order,
        },
      },
      data: {
        dayplace_order: {
          decrement: 1,
        },
      },
    });

    return { deleted: true };
  });
}

//7.저장된 여행 일정 불러오기
async function getMyTripsService(user_id) {
  return await prisma.trip.findMany({
    where: { user_id },
    orderBy: { start_date: "desc" },
  });
}

module.exports = { createTripService , getTripIdService, addPlaceToDayService, reorderPlaceService, reorderDayService, deletePlaceFromDayService, getMyTripsService};
