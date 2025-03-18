const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// 일정 초대 보내기
router.post("/invite", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, invited_nickname } = req.body;
    const inviter = req.user;

    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (!invited_nickname || typeof invited_nickname !== "string") {
      return res.status(400).json({ message: "초대할 사용자의 닉네임을 입력해주세요." });
    }

    if (invited_nickname === inviter.nickname) {
      return res.status(400).json({ message: "자신을 일정에 초대할 수 없습니다." });
    }

    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }
    if (trip.user_id !== inviter.user_id) {
      return res.status(403).json({ message: "이 일정을 초대할 권한이 없습니다." });
    }

    const invitedUser = await prisma.user.findUnique({ where: { nickname: invited_nickname } });
    if (!invitedUser) {
      return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
    }

    const existingInvitation = await prisma.tripInvitation.findFirst({
      where: { trip_id, invited_user_id: invitedUser.user_id },
    });
    if (existingInvitation) {
      return res.status(400).json({ message: "이미 이 사용자를 초대했습니다." });
    }

    const invitation = await prisma.tripInvitation.create({
      data: { trip_id, invited_user_id: invitedUser.user_id, status: "PENDING", permission: "editor" },
    });

    res.status(201).json({ message: "일정 초대가 성공적으로 전송되었습니다.", invitation });
  } catch (error) {
    console.error("일정 초대 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 수락
router.put("/invite/accept", authenticateJWT, async (req, res) => {
  try {
    const { invitation_id } = req.body;
    const user = req.user;

    if (!invitation_id || typeof invitation_id !== "string") {
      return res.status(400).json({ message: "유효한 초대 ID를 입력해주세요." });
    }

    const invitation = await prisma.tripInvitation.findUnique({ where: { invitation_id } });
    if (!invitation) {
      return res.status(404).json({ message: "초대를 찾을 수 없습니다." });
    }

    if (invitation.invited_user_id !== user.user_id) {
      return res.status(403).json({ message: "이 초대를 수락할 권한이 없습니다." });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 초대입니다." });
    }

    const updatedInvitation = await prisma.tripInvitation.update({
      where: { invitation_id },
      data: { status: "ACCEPTED" },
    });

    res.json({ message: "일정 초대가 수락되었습니다.", invitation: updatedInvitation });
  } catch (error) {
    console.error("일정 초대 수락 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 거절
router.put("/invite/reject", authenticateJWT, async (req, res) => {
  try {
    const { invitation_id } = req.body;
    const user = req.user;

    if (!invitation_id || typeof invitation_id !== "string") {
      return res.status(400).json({ message: "유효한 초대 ID를 입력해주세요." });
    }

    const invitation = await prisma.tripInvitation.findUnique({ where: { invitation_id } });
    if (!invitation) {
      return res.status(404).json({ message: "초대를 찾을 수 없습니다." });
    }

    if (invitation.invited_user_id !== user.user_id) {
      return res.status(403).json({ message: "이 초대를 거절할 권한이 없습니다." });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 초대입니다." });
    }

    const updatedInvitation = await prisma.tripInvitation.update({
      where: { invitation_id },
      data: { status: "REJECTED" },
    });

    res.json({ message: "일정 초대가 거절되었습니다.", invitation: updatedInvitation });
  } catch (error) {
    console.error("일정 초대 거절 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 받은 PENDING 초대 목록 조회
router.get("/invite/pending", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    const pendingInvitations = await prisma.tripInvitation.findMany({
      where: { invited_user_id: user.user_id, status: "PENDING" },
      include: {
        Trip: { select: { trip_id: true, title: true, user_id: true } },
        User: { select: { user_id: true, nickname: true, image_url: true } },
      },
    });

    const invitations = pendingInvitations.map((invitation) => ({
      invitation_id: invitation.invitation_id,
      trip_id: invitation.trip_id,
      trip_title: invitation.Trip.title,
      inviter_id: invitation.Trip.user_id,
      inviter_nickname: invitation.User.nickname,
      inviter_image_url: invitation.User.image_url,
      permission: invitation.permission,
      created_at: invitation.created_at,
    }));

    res.json({ message: "받은 초대 목록 조회 성공", pendingInvitations: invitations });
  } catch (error) {
    console.error("받은 초대 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 조회
router.get("/:trip_id", authenticateJWT, async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user = req.user;

    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: { trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "이 일정에 접근할 권한이 없습니다." });
    }

    res.json({ message: "일정 조회 성공", trip });
  } catch (error) {
    console.error("일정 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 수정
router.put("/update", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, title, start_date, end_date, destinations, is_shared, companion_type, theme, version } = req.body;
    const user = req.user;

    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (typeof version !== "number") {
      return res.status(400).json({ message: "현재 버전을 입력해주세요." });
    }

    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    const isOwner = trip.user_id === user.user_id;
    let hasEditorPermission = false;
    if (!isOwner) {
      const invitation = await prisma.tripInvitation.findFirst({
        where: { trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
      });
      hasEditorPermission = invitation && invitation.permission === "editor";
      if (!hasEditorPermission) {
        return res.status(403).json({ message: "이 일정을 수정할 권한이 없습니다." });
      }
    }

    if (trip.version !== version) {
      return res.status(409).json({
        message: "일정이 다른 사용자에 의해 수정되었습니다.",
        currentVersion: trip.version,
        trip,
      });
    }

    const updateData = { version: trip.version + 1 };
    if (title) updateData.title = title;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);
    if (destinations) updateData.destinations = destinations;
    if (is_shared) updateData.is_shared = is_shared;
    if (companion_type) updateData.companion_type = companion_type;
    if (theme) updateData.theme = theme;

    const updatedTrip = await prisma.trip.update({
      where: { trip_id },
      data: updateData,
    });

    res.json({ message: "일정이 성공적으로 수정되었습니다.", trip: updatedTrip });
  } catch (error) {
    console.error("일정 수정 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 지출 생성 (건당 입력)
router.post("/expense/create", authenticateJWT, async (req, res) => {
    try {
      const { trip_id, day_id, type, title, price } = req.body;
      const user = req.user;
  
      // 유효성 검사
      if (!trip_id || typeof trip_id !== "string") {
        return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
      }
      if (!type || !["FOOD", "TRANSPORT", "ACCOMMODATION", "TICKET", "ACTIVITY", "SHOPPING", "OTHER"].includes(type)) {
        return res.status(400).json({ message: "유효한 지출 유형을 입력해주세요 (FOOD, TRANSPORT, ACCOMMODATION, TICKET, ACTIVITY, SHOPPING, OTHER)." });
      }
      if (!title || typeof title !== "string") {
        return res.status(400).json({ message: "지출 내용을 입력해주세요." });
      }
      if (!price || typeof price !== "number" || price <= 0) {
        return res.status(400).json({ message: "유효한 금액을 입력해주세요." });
      }
  
      // 일정 존재 확인 및 권한 체크
      const trip = await prisma.trip.findUnique({ where: { trip_id } });
      if (!trip) {
        return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
      }
  
      const isOwner = trip.user_id === user.user_id;
      const invitation = await prisma.tripInvitation.findFirst({
        where: { trip_id, invited_user_id: user.user_id, status: "ACCEPTED" },
      });
      if (!isOwner && !invitation) {
        return res.status(403).json({ message: "이 일정에 지출을 추가할 권한이 없습니다." });
      }
  
      // day_id 유효성 검사 (제공된 경우)
      if (day_id !== undefined && day_id !== null) {
        const day = await prisma.day.findUnique({ where: { day_id } });
        if (!day || day.trip_id !== trip_id) {
          return res.status(400).json({ message: "유효하지 않은 day_id입니다. 해당 일정이 여행에 속해야 합니다." });
        }
      }
  
      // 지출 생성
      const expense = await prisma.expense.create({
        data: {
          trip_id,
          user_id: user.user_id,
          day_id: day_id || null, // null이면 여행 준비 지출
          type,
          title,
          price,
        },
      });
  
      res.status(201).json({ message: "지출 추가 성공", expense });
    } catch (error) {
      console.error("지출 생성 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

module.exports = router;