const express = require("express");
const tripController = require("../controller/scheduleController");
const {authenticateJWT} =require("../middleware/authMiddleware");

const router = express.Router();
//1. 여정추가
router.post("/", authenticateJWT, tripController.createTripController);

//2. 여행 상세 정보 가져오기
router.get("/:trip_id", authenticateJWT, tripController.getTripIdController);

//3. 일차별 장소 추가
router.post("/:trip_id/day/:day_id/place",authenticateJWT,tripController.addPlaceToDayController);

//4. 장소순서 변경, 날짜별 이동도 가능
router.patch("/:trip_id/reorder",authenticateJWT, tripController.reorderPlaceController);

//5. 장소 삭제
router.delete("/:trip_id/day/:day_id/place/:place_id",authenticateJWT, tripController.deletePlaceFromDayController);

module.exports = router;