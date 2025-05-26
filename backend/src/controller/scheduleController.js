const tripService = require("../services/scheduleService");
const prisma = require("../../prisma/prismaClient");

//1. 여행 생성 컨트롤러
async function createTripController(req,res){
    try {
        const userId = req.user.user_id; //user_id 가져옴
        const tripData = req.body;

        //프리즈마 Trip 테이블 호출
        const newTrip = await tripService.createTripService(userId, tripData);

        return res.status(201).json({ success: true, trip: newTrip });
    } catch (error){
        res.status(500).json({message: "createTripController 중 실패", error});
    }
}

//2. 여행 정보 조회 컨트롤러
async function getTripIdController(req, res) {
    try {
        const { trip_id } = req.params;
        const user_id = req.user.user_id;

        const trip = await tripService.getTripIdService(trip_id);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isCreator = trip.user_id === user_id;

        let isEditor = false;
        if (!isCreator) {
            const invitation = await prisma.tripInvitation.findFirst({
                where: {
                    trip_id,
                    invited_user_id: user_id,
                    status: 'ACCEPTED',
                    permission: 'editor',
                },
            });
            isEditor = !!invitation;
        }

        const canEdit = isCreator || isEditor;

        return res.status(200).json({ trip, canEdit });
    } catch (error) {
        console.error("getTripIdController error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

//3. 특정 Day에 장소 추가 컨트롤러
async function addPlaceToDayController(req,res){
    try {
        const {day_id} = req.params;
        const placeData = req.body;
    
        const result = await tripService.addPlaceToDayService(Number(day_id),placeData);
    
        return res.status(201).json({success: true, data: result});
    } catch (error) {
        console.error("addPlaceToDayController 중 에러", error);        
    }
}

//4. 장소 순서 변경 컨트롤러
// previous : 장소가 있었던 위치, present: 이 장소를 옮기고 싶은 위치
async function reorderPlaceController(req,res){
    try {
        const {trip_id}=req.params;
        const {previous, present}=req.body;

        const result = await tripService.reorderPlaceService(previous, present);

        return res.status(201).json({success: true, data: result});
    } catch (error) {
        console.error("reorderPlaceController 중 에러", error); 
    }
}

//5. 날짜 순서 변경 컨트롤러
async function reorderDayController(req,res){
    try {
        const {trip_id}=req.params;
        const {previous, present}=req.body;

        const result = await tripService.reorderDayService(trip_id, previous, present);

        return res.status(201).json({success: true, data: result});
    } catch (error) {
        console.error("reorderDayController 중 에러", error); 
    }
}

//6. day별 장소 삭제 컨트롤러
async function deletePlaceController(req, res) {
    try {
        const { dayplace_id } = req.params;
        const result = await tripService.deletePlaceService(Number(dayplace_id));
  
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("deletePlaceService 중 에러:", error);
    }
}

//7.저장된 여행 일정 불러오기 컨트롤러
async function getMytripsController(req, res) {
    try {
      const user_id = req.user.user_id;
      const trips = await tripService.getMyTripsService(user_id);
  
      res.json({ success: true, trips });
    } catch (error) {
        console.error("getMyTripsController 에러:", error);
    }
}

// 8. 여행삭제 컨트롤러
async function deleteTripController(req,res){
    try {
        const { trip_id } = req.params;
        const result = await tripService.deleteTripService(trip_id);
    
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("deleteTripController 중 에러", error);
    }
}

//9. AI 여행 일정 생성 컨트롤러
async function generateDaysController(req, res) {
    try {
      const { trip_id } = req.params;
      const result = await tripService.generateDaysService(trip_id);
      res.status(200).json({ success: true, days: result });
    } catch (err) {
      console.error("generateDaysController 오류:", err);
      res.status(500).json({ error: "AI 일정 생성 실패" });
    }
}

async function updateTripTitleController(req, res) {
    try {
        const { trip_id } = req.params;
        const { title } = req.body;
        const user_id = req.user.user_id;

        const updatedTrip = await tripService.updateTripTitleService(user_id, trip_id, title);

        return res.status(200).json({ success: true, trip: updatedTrip });
    } catch (error) {
        console.error("updateTripTitleController error:", error);
        if (error.message === 'Trip not found') {
            return res.status(404).json({ message: "Trip not found" });
        } else if (error.message === 'No permission to edit') {
            return res.status(403).json({ message: "You don't have permission to edit this trip" });
        } else {
            return res.status(500).json({ message: "Failed to update trip title", error });
        }
    }
}

async function reorderBasedOnFeedbackController(req, res) {
  try {
    const { trip_id } = req.params;
    const { day, distanceFeedback } = req.body;

    const result = await tripService.reorderBasedOnFeedbackService(trip_id, day, distanceFeedback);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("reorderBasedOnFeedbackController 중 에러", error);
    return res.status(500).json({ message: "재정렬 실패", error });
  }
}

module.exports = {reorderBasedOnFeedbackController, createTripController, getTripIdController, addPlaceToDayController, reorderPlaceController, reorderDayController, deletePlaceController, getMytripsController, deleteTripController, generateDaysController, updateTripTitleController};