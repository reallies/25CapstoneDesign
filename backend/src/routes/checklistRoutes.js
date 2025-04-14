const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// 체크리스트 항목 생성
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, item } = req.body;
    const user = req.user;

    // 입력값 검증
    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (!item || typeof item !== "string") {
      return res.status(400).json({ message: "체크리스트 항목을 입력해주세요." });
    }

    // 여행 일정 존재 여부 확인
    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    // 권한 확인 (소유자 또는 초대된 사용자)
    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: { trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "체크리스트를 추가할 권한이 없습니다." });
    }

    // 체크리스트 항목 생성
    const checklistItem = await prisma.checklist.create({
      data: {
        trip_id,
        item,
        is_checked: false,
      },
    });

    res.status(201).json({ message: "체크리스트 항목 추가 성공", checklistItem });
  } catch (error) {
    console.error("체크리스트 생성 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 체크리스트 항목 조회
router.get("/:trip_id", authenticateJWT, async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user = req.user;

    // 여행 일정 존재 여부 확인
    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    // 권한 확인
    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: { trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "체크리스트를 조회할 권한이 없습니다." });
    }

    // 체크리스트 항목 조회
    const checklistItems = await prisma.checklist.findMany({
      where: { trip_id },
      orderBy: { checklist_id: "asc" },
    });

    res.json({ message: "체크리스트 조회 성공", checklistItems });
  } catch (error) {
    console.error("체크리스트 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 체크리스트 항목 수정
router.put("/update/:checklist_id", authenticateJWT, async (req, res) => {
  try {
    const { checklist_id } = req.params;
    const { item, is_checked } = req.body;
    const user = req.user;

    // 체크리스트 항목 존재 여부 확인
    const checklistItem = await prisma.checklist.findUnique({
      where: { checklist_id: parseInt(checklist_id) },
    });
    if (!checklistItem) {
      return res.status(404).json({ message: "체크리스트 항목을 찾을 수 없습니다." });
    }

    // 여행 일정 및 권한 확인
    const trip = await prisma.trip.findUnique({ where: { trip_id: checklistItem.trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }
    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: { trip_id: trip.trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "체크리스트를 수정할 권한이 없습니다." });
    }

    // 수정 데이터 준비
    const updateData = {};
    if (item) updateData.item = item;
    if (typeof is_checked === "boolean") updateData.is_checked = is_checked;

    // 수정 데이터가 없으면 오류 반환
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "수정할 항목 또는 완료 상태를 제공해주세요." });
    }

    // 체크리스트 항목 수정
    const updatedChecklistItem = await prisma.checklist.update({
      where: { checklist_id: parseInt(checklist_id) },
      data: updateData,
    });

    res.json({ message: "체크리스트 항목 수정 성공", checklistItem: updatedChecklistItem });
  } catch (error) {
    console.error("체크리스트 수정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 체크리스트 항목 삭제
router.delete("/delete/:checklist_id", authenticateJWT, async (req, res) => {
  try {
    const { checklist_id } = req.params;
    const user = req.user;

    // 체크리스트 항목 존재 여부 확인
    const checklistItem = await prisma.checklist.findUnique({
      where: { checklist_id: parseInt(checklist_id) },
    });
    if (!checklistItem) {
      return res.status(404).json({ message: "체크리스트 항목을 찾을 수 없습니다." });
    }

    // 여행 일정 및 권한 확인
    const trip = await prisma.trip.findUnique({ where: { trip_id: checklistItem.trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }
    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: { trip_id: trip.trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "체크리스트를 삭제할 권한이 없습니다." });
    }

    // 체크리스트 항목 삭제
    await prisma.checklist.delete({ where: { checklist_id: parseInt(checklist_id) } });

    res.json({ message: "체크리스트 항목 삭제 성공" });
  } catch (error) {
    console.error("체크리스트 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;