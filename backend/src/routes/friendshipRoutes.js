const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// 친구 요청 보내기
router.post("/request", authenticateJWT, async (req, res) => {
  try {
    const { recipient_nickname } = req.body;
    const requester = req.user;

    if (!recipient_nickname || typeof recipient_nickname !== "string") {
      return res.status(400).json({ message: "수신자 닉네임을 입력해주세요." });
    }

    if (recipient_nickname === requester.nickname) {
      return res.status(400).json({ message: "자신에게 친구 요청을 보낼 수 없습니다." });
    }

    const recipient = await prisma.user.findUnique({
      where: { nickname: recipient_nickname },
    });
    if (!recipient) {
      return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
    }

    const existingRequest = await prisma.friendship.findFirst({
      where: { requester_id: requester.user_id, recipient_id: recipient.user_id },
    });
    if (existingRequest) {
      return res.status(400).json({ message: "이미 친구 요청을 보냈습니다." });
    }

    const friendship = await prisma.friendship.create({
      data: { requester_id: requester.user_id, recipient_id: recipient.user_id, status: "PENDING" },
    });

    res.status(201).json({ message: "친구 요청이 성공적으로 전송되었습니다.", friendship });
  } catch (error) {
    console.error("친구 요청 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 요청 수락
router.put("/accept", authenticateJWT, async (req, res) => {
  try {
    const { friendship_id } = req.body;
    const user = req.user;

    if (!friendship_id || isNaN(friendship_id)) {
      return res.status(400).json({ message: "유효한 친구 요청 ID를 입력해주세요." });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendship_id) },
    });
    if (!friendship) {
      return res.status(404).json({ message: "친구 요청을 찾을 수 없습니다." });
    }

    if (friendship.recipient_id !== user.user_id) {
      return res.status(403).json({ message: "이 요청을 수락할 권한이 없습니다." });
    }

    if (friendship.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 요청입니다." });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendship_id) },
      data: { status: "ACCEPTED" },
    });

    res.json({ message: "친구 요청이 수락되었습니다.", friendship: updatedFriendship });
  } catch (error) {
    console.error("친구 요청 수락 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 요청 거절
router.put("/reject", authenticateJWT, async (req, res) => {
  try {
    const { friendship_id } = req.body;
    const user = req.user;

    if (!friendship_id || isNaN(friendship_id)) {
      return res.status(400).json({ message: "유효한 친구 요청 ID를 입력해주세요." });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendship_id) },
    });
    if (!friendship) {
      return res.status(404).json({ message: "친구 요청을 찾을 수 없습니다." });
    }

    if (friendship.recipient_id !== user.user_id) {
      return res.status(403).json({ message: "이 요청을 거절할 권한이 없습니다." });
    }

    if (friendship.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 요청입니다." });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendship_id) },
      data: { status: "REJECTED" },
    });

    res.json({ message: "친구 요청이 거절되었습니다.", friendship: updatedFriendship });
  } catch (error) {
    console.error("친구 요청 거절 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 목록 조회
router.get("/list", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requester_id: user.user_id }, { recipient_id: user.user_id }],
        status: "ACCEPTED",
      },
      include: {
        User_Friendship_requester_idToUser: { select: { user_id: true, nickname: true, image_url: true } },
        User_Friendship_recipient_idToUser: { select: { user_id: true, nickname: true, image_url: true } },
      },
    });

    const friends = friendships.map((friendship) =>
      friendship.requester_id === user.user_id
        ? {
            user_id: friendship.recipient_id,
            nickname: friendship.User_Friendship_recipient_idToUser.nickname,
            image_url: friendship.User_Friendship_recipient_idToUser.image_url,
          }
        : {
            user_id: friendship.requester_id,
            nickname: friendship.User_Friendship_requester_idToUser.nickname,
            image_url: friendship.User_Friendship_requester_idToUser.image_url,
          }
    );

    res.json({ message: "친구 목록 조회 성공", friends });
  } catch (error) {
    console.error("친구 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 받은 PENDING 친구 요청 목록 조회
router.get("/pending", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    const pendingRequests = await prisma.friendship.findMany({
      where: { recipient_id: user.user_id, status: "PENDING" },
      include: {
        User_Friendship_requester_idToUser: { select: { user_id: true, nickname: true, image_url: true } },
      },
    });

    const requests = pendingRequests.map((request) => ({
      friendship_id: request.id,
      requester_id: request.requester_id,
      requester_nickname: request.User_Friendship_requester_idToUser.nickname,
      requester_image_url: request.User_Friendship_requester_idToUser.image_url,
      created_at: request.created_at,
    }));

    res.json({ message: "받은 친구 요청 목록 조회 성공", pendingRequests: requests });
  } catch (error) {
    console.error("받은 친구 요청 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;