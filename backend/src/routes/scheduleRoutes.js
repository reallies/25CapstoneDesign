const express = require("express");
const tripController = require("../controller/scheduleController");
const {authenticateJWT} =require("../middleware/authMiddleware");
const prisma = require("../../prisma/prismaClient");

const router = express.Router();
//7. 저장된 여행 여러개 불러오기 - 2.번 라우트보다 앞으로 와야함
router.get("/myTrips",authenticateJWT, tripController.getMytripsController);
//10. 최신 여행 불러오기
router.get("/recent", authenticateJWT, async (req, res) => {
    try {
      const latestTrip = await prisma.trip.findFirst({
        where: { user_id: req.user.user_id },
        orderBy: { updated_at: "desc" },
      });
  
      if (!latestTrip) {
        return res.status(404).json({ message: "생성된 여행이 없습니다." });
      }
  
      res.json({ success: true, trip_id: latestTrip.trip_id });
    } catch (err) {
      res.status(500).json({ message: "서버 오류" });
    }
});

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
router.delete("/:trip_id/day/:day_id/dayplace/:dayplace_id",authenticateJWT, tripController.deletePlaceController);

//8. 여행 삭제
router.delete("/:trip_id", authenticateJWT, tripController.deleteTripController)

//9. AI 추천 일정 자동 생성 - 무시
router.post("/:trip_id/generate-days", authenticateJWT, tripController.generateDaysController);


module.exports = router;