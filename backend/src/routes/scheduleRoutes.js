const express = require("express");
const tripController = require("../controller/scheduleController");
const {authenticateJWT} =require("../middleware/authMiddleware");

const router = express.Router();
//7. 저장된 여행 일정 불러오기 -- 2.번 라우트보다 앞으로 와야함
router.get("/myTrips",authenticateJWT, tripController.getMytripsController);

//1. 여행 생성
router.post("/", authenticateJWT, tripController.createTripController);

//2. 여행 생성시, 여행정보 가져오기
router.get("/:trip_id", authenticateJWT, tripController.getTripIdController);

//3. 일차별 장소 추가
router.post("/:trip_id/day/:day_id/place",authenticateJWT,tripController.addPlaceToDayController);

//4. 장소순서 변경, 날짜별 이동도 가능
router.patch("/:trip_id/reorderPlace",authenticateJWT, tripController.reorderPlaceController);

//5. 날짜순서 변경
router.patch("/:trip_id/reorderDay",authenticateJWT, tripController.reorderDayController);

//6. 장소 삭제
router.delete("/:trip_id/day/:day_id/place/:place_id",authenticateJWT, tripController.deletePlaceFromDayController);


module.exports = router;