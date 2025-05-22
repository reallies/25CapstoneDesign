const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// 리뷰 작성
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, title, content, visibility, image_urls, rating } = req.body;
    const user = req.user;

    if (!trip_id || !content) {
      return res.status(400).json({ message: "일정 ID와 내용을 입력해주세요." });
    }

    const trip = await prisma.trip.findUnique({ where: { trip_id } });
    if (!trip) {
      return res.status(404).json({ message: "일정을 찾을 수 없습니다." });
    }

    // if (rating !== undefined && (rating < 0 || rating > 5)) {
    //   return res.status(400).json({ message: "평점은 0~5 사이여야 합니다." });
    // }

    const post = await prisma.post.create({
      data: {
        trip_id,
        user_id: user.user_id,
        title,
        content,
        visibility: visibility || "PUBLIC",
        image_urls: image_urls || [],
        rating: rating != null ? rating : null,
      },
    });

    res.status(201).json({ message: "리뷰 작성 성공", post });
  } catch (error) {
    console.error("리뷰 작성 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 리뷰 조회
router.get("/:trip_id", authenticateJWT, async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user = req.user;

    const posts = await prisma.post.findMany({
      where: { trip_id },
      include: {
        user: { select: { user_id: true, nickname: true } },
      },
    });

    const filteredPosts = posts.filter((post) => {
      if (post.visibility === "PUBLIC") return true;
      if (post.visibility === "PRIVATE" && post.user_id === user.user_id) return true;
      if (post.visibility === "FRIENDS_ONLY") {
        return checkFriendship(user.user_id, post.user_id);
      }
      return false;
    });

    res.json({ message: "리뷰 조회 성공", posts: filteredPosts });
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 관계 확인 함수
async function checkFriendship(userId, postUserId) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requester_id: userId, recipient_id: postUserId, status: "ACCEPTED" },
        { requester_id: postUserId, recipient_id: userId, status: "ACCEPTED" },
      ],
    },
  });
  return !!friendship;
}

module.exports = router;