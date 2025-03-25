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
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const cloned = new Date(d);
          dayList.push({
            date: cloned,
            trip_id: tripId,
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
            orderBy: { date: 'asc'},
            include: {
              places: {
                include: {
                  place: true, // 실제 place 정보까지 포함
                },
                orderBy: {
                  order: 'asc' // 장소 순서대로 정렬
                }
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

  // 1. kakao_place_id 중복체크
  let place = await prisma.place.findUnique({
    where: {kakao_place_id},
  })
  if(!place){ //kakao_place_id가 없다면 생성
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

    //count : day_id에 해당하는 place 개수
    const count = await prisma.dayPlace.count({
      where: {day_id}
    });
    //2. 장소가 추가될 경우 count+1 -> order 계산을 위함
    const dayPlace = await prisma.dayPlace.create({
      data:{
        day_id,
        place_id : place.place_id,
        order: count +1
      }
    });

    return {place, dayPlace};
}

//4. 장소 순서 변경 서비스
// previous : 장소가 있었던 위치, present: 이 장소를 옮기고 싶은 위치
async function reorderPlaceService(previous,present){
  const {day_id : previousDayId, place_id} = previous;
  const {day_id : presentDayId, order: newOrder } = present;

  return await prisma.$transaction(async (tx)=>{
    //1. previous의 dayPlace 삭제
    const deleted = await tx.dayPlace.delete({
      where : {
        day_id_place_id: {
          day_id: previousDayId,
          place_id: place_id,
        },
      }
    });

    //2. present의 order 조정
    await tx.dayPlace.updateMany({
      where: {
        day_id: presentDayId,
        order: {
          gte: newOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });

    // 3. 새로운 위치에 삽입
    const newDayPlace = await tx.dayPlace.create({
      data: {
        day_id: presentDayId,
        place_id,
        order: newOrder,
      },
    });

    return newDayPlace;
  });
}

//5. day별 장소 삭제 서비스
async function deletePlaceFromDayService(day_id, place_id) {
  return await prisma.$transaction(async (tx) => {
    // 1. 삭제할 dayPlace의 order 찾기 
    const target = await tx.dayPlace.findUnique({
      where: {
        day_id_place_id: {
          day_id,
          place_id,
        },
      },
    });

    if (!target) {
      throw new Error("해당 Day에 지정된 장소가 없습니다.");
    }

    // 2. 해당 dayPlace 삭제
    await tx.dayPlace.delete({
      where: {
        day_id_place_id: {
          day_id,
          place_id,
        },
      },
    });

    // 3. 그 뒤의 order 조정
    await tx.dayPlace.updateMany({
      where: {
        day_id,
        order: {
          gt: target.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });

    return { deleted: true };
  });
}

module.exports = { createTripService , getTripIdService, addPlaceToDayService, reorderPlaceService, deletePlaceFromDayService};
