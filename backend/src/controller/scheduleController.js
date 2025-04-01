const tripService = require("../services/scheduleService");

// 1. 여행 추가 컨트롤러
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

// 2. tripId로 여행정보 접근 컨트롤러
async function getTripIdController(req,res){
    try {
        const {trip_id} = req.params;

        const trip = await tripService.getTripIdService(trip_id);
        if(!trip){
            return res.status(404).json({message: "여행을 찾을 수 없습니다."});
        }
        return res.status(200).json({trip});
    } catch (error) {
        console.error("getTripIdController 중 에러", error);        
    }
}

//3. Day별 장소 추가 컨트롤러
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

//5. day별 장소 삭제 컨트롤러
async function deletePlaceFromDayController(req, res) {
    try {
      const { day_id, place_id } = req.params;
  
      const result = await tripService.deletePlaceFromDayService(Number(day_id), Number(place_id));
  
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("deletePlaceFromDayController 중 에러:", error);
      return res.status(500).json({ message: "장소 삭제 실패", error });
    }
  }

module.exports = {createTripController, getTripIdController, addPlaceToDayController, reorderPlaceController, deletePlaceFromDayController};