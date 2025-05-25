//postRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// ---- Multer 설정: 업로드 디렉토리와 파일명 지정 ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ dest: "uploads/" });

// ---- 이미지 업로드 엔드포인트 ----
// POST /posts/upload

router.post(
  "/upload",
  authenticateJWT,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일을 찾을 수 없습니다." });
    }
    // 정적 서빙 경로를 /uploads 로 매핑
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.json({ url });
  }
);

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

// 갤러리용 모든 PUBLIC 리뷰 조회
router.get(
  "/gallery",
  authenticateJWT,
  async (req, res) => {
    try {
      // 공개(visibility: PUBLIC) 상태인 리뷰만
      const posts = await prisma.post.findMany({
        where: { visibility: "PUBLIC" },
        include: {
          user: { select: { user_id: true, nickname: true, image_url: true } },
        },
      });
      res.json({ message: "갤러리용 리뷰 조회 성공", posts });
    } catch (error) {
      console.error("갤러리용 리뷰 조회 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  }
);
// 내 리뷰 조회
router.get(
  "/me",
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.user_id;
      const posts = await prisma.post.findMany({
        where: { user_id: userId },
        include: {
          // 필요하다면 유저 정보도 포함
          user: { select: { user_id: true, nickname: true, image_url: true } },
        },
      });
      res.json({ message: "내 포스트 조회 성공", posts });
    } catch (error) {
      console.error("내 포스트 조회 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  }
);


// 특정 리뷰 조회
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