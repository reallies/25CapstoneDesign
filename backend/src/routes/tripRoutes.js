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
        Trip: { include: { user: { select: { nickname: true, image_url: true } } } }
      },
    });

    const invitations = pendingInvitations.map((invitation) => ({
      invitation_id: invitation.invitation_id,
      trip_id: invitation.trip_id,
      trip_title: invitation.Trip.title,
      inviter_id: invitation.Trip.user_id,
      inviter_nickname: invitation.Trip.user.nickname,
      inviter_image_url: invitation.Trip.user.image_url,
      permission: invitation.permission,
      created_at: invitation.created_at,
    }));

    res.json({ message: "받은 초대 목록 조회 성공", pendingInvitations: invitations });
  } catch (error) {
    console.error("받은 초대 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 수락한 초대된 여행 일정 조회 (ACCEPTED)
router.get("/invitations/accepted", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    const invitations = await prisma.tripInvitation.findMany({
      where: {
        invited_user_id: user.user_id,
        status: "ACCEPTED",
      },
      include: {
        Trip: {
          select: {
            trip_id: true,
            title: true,
            start_date: true,
            end_date: true,
            destinations: true,
            updated_at: true,
          },
        },
        User: { select: { nickname: true } },
      },
    });

    const formattedInvitations = invitations.map((invitation) => ({
      invitation_id: invitation.invitation_id,
      trip_id: invitation.trip_id,
      trip_title: invitation.Trip.title,
      start_date: invitation.Trip.start_date,
      end_date: invitation.Trip.end_date,
      destinations: invitation.Trip.destinations,
      updated_at: invitation.Trip.updated_at,
      inviter_nickname: invitation.User.nickname,
    }));

    res.json({ message: "수락한 초대 일정 조회 성공", invitations: formattedInvitations });
  } catch (error) {
    console.error("수락한 초대 일정 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 조회
router.get("/:trip_id", authenticateJWT, async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user = req.user;

    // 수정: TripInvitation으로 필드 이름 변경
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
      include: {
        days: { orderBy: { date: "asc" } },
        TripInvitation: {
          where: { status: "ACCEPTED" },
          include: { User: { select: { user_id: true, nickname: true } } },
        },
        user: { select: { user_id: true, nickname: true } },
      },
    });
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

    const participants = [
      { user_id: trip.user.user_id, nickname: trip.user.nickname },
      ...trip.TripInvitation.map((inv) => ({
        user_id: inv.User.user_id,
        nickname: inv.User.nickname,
      })),
    ];

    res.json({ message: "일정 조회 성공", trip, participants });
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

// 지출 목록 조회
router.get("/:trip_id/expenses", authenticateJWT, async (req, res) => {
    try {
      const { trip_id } = req.params;
      const { day_id, user_id } = req.query; // 쿼리 파라미터
      const user = req.user;
  
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
        return res.status(403).json({ message: "이 일정의 지출을 조회할 권한이 없습니다." });
      }
  
      // 필터 조건 설정
      const where = { trip_id };
      if (day_id !== undefined) {
        where.day_id = day_id === "null" ? null : parseInt(day_id);
      }
      if (user_id !== undefined) {
        where.user_id = parseInt(user_id);
      }
  
      // 지출 목록 조회
      const expenses = await prisma.expense.findMany({
        where,
        include: {
          user: { select: { nickname: true } }, // 지출한 사용자의 닉네임
          day: { select: { date: true } },     // 일자 정보 (null 가능)
        },
        orderBy: { created_at: "asc" }, // 생성 순으로 정렬
      });
  
      res.json({ message: "지출 목록 조회 성공", expenses });
    } catch (error) {
      console.error("지출 목록 조회 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 정산 계산
  router.get("/:trip_id/settle", authenticateJWT, async (req, res) => {
    try {
      const { trip_id } = req.params;
      const user = req.user;
  
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
        return res.status(403).json({ message: "이 일정의 정산 정보를 조회할 권한이 없습니다." });
      }
  
      // 참여자 목록 (소유자 + 초대받고 수락한 사용자)
      const participants = [
        await prisma.user.findUnique({ where: { user_id: trip.user_id }, select: { user_id: true, nickname: true } }),
        ...(await prisma.tripInvitation.findMany({
          where: { trip_id, status: "ACCEPTED" },
          include: { User: { select: { user_id: true, nickname: true } } },
        })).map((inv) => inv.User),
      ].filter(Boolean);
  
      // 사용자별 지출 합계
      const expenses = await prisma.expense.groupBy({
        by: ["user_id"],
        where: { trip_id },
        _sum: { price: true },
      });
  
      const userExpenses = participants.map((participant) => {
        const expense = expenses.find((e) => e.user_id === participant.user_id);
        return {
          user_id: participant.user_id,
          nickname: participant.nickname,
          total: expense?._sum.price || 0,
        };
      });
  
      // 총 지출 및 평균 계산
      const totalAmount = userExpenses.reduce((acc, u) => acc + u.total, 0);
      const averageAmount = totalAmount / userExpenses.length;
  
      // 각 사용자의 차액 계산
      const balances = userExpenses.map((u) => ({
        nickname: u.nickname,
        balance: u.total - averageAmount,
      }));
  
      // 송금 정보 계산 (최소 송금 횟수)
      const creditors = balances.filter((b) => b.balance > 0); // 받아야 할 사람
      const debtors = balances.filter((b) => b.balance < 0); // 내야 할 사람
      const settlements = [];
      let i = 0,
        j = 0;
  
      while (i < creditors.length && j < debtors.length) {
        const amount = Math.min(creditors[i].balance, -debtors[j].balance);
        if (amount > 0) {
          settlements.push({
            from: debtors[j].nickname,
            to: creditors[i].nickname,
            amount: Math.round(amount), // 소수점 반올림
          });
        }
        creditors[i].balance -= amount;
        debtors[j].balance += amount;
        if (creditors[i].balance <= 0) i++;
        if (debtors[j].balance >= 0) j++;
      }
  
      // 수정: userExpenses를 응답에 포함
      res.json({
        message: "정산 정보",
        total_amount: totalAmount,
        average_amount: averageAmount,
        settlements,
        userExpenses, // 추가
      });
    } catch (error) {
      console.error("정산 계산 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

// 사용자 프로필 조회
router.get("/users/:nickname/profile", authenticateJWT, async (req, res) => {
  const { nickname } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { nickname },
      select: { nickname: true, image_url: true },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;