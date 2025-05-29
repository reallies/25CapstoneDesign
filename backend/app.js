//app.js
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const passport = require("./src/config/passport");
const { authenticateJWT } = require("./src/middleware/authMiddleware");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL, // React 개발 서버
  credentials: true, // 쿠키 포함 허용
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"] //헤더 노출
}));

app.use(cookieParser()); //cookie-parser를 먼저 실행

// 세션 미들웨어 추가
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 배포 환경에서만 secure 활성화
    sameSite: "None"
  }
}));

// Passport 초기화 및 세션 사용 설정
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

//소셜 로그인 & 로그아웃
const authRoutes = require("./src/routes/authRoutes");
app.use("/auth", authRoutes);

// 친구추가 & 일정 초대
const friendshipRoutes = require("./src/routes/friendshipRoutes");
const tripRoutes = require("./src/routes/tripRoutes");
app.use("/friendship", friendshipRoutes);
app.use("/trip", tripRoutes);

// 여행 리뷰 작성
const postRoutes = require("./src/routes/postRoutes");
app.use("/posts", postRoutes);

// 체크 리스트
const checklistRoutes = require("./src/routes/checklistRoutes");
app.use("/checklist", checklistRoutes);

//챗봇
const openAIChatbot = require('./src/routes/openAIChat');
app.use('/chatbot', openAIChatbot);

//인증된 사용자만 프로필 접근 가능
app.get("/profile", authenticateJWT, (req, res) => res.json(req.user));

//여행&일정 추가
const scheduleRoutes = require("./src/routes/scheduleRoutes");
app.use("/schedule", scheduleRoutes);

//피드백
const feedbackRoutes = require("./src/routes/feedbackRoutes");
app.use("/feedback", feedbackRoutes);

// 파일 시스템의 uploads 폴더를 웹상의 /uploads 경로로 연결
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));
//개발환경에서는 server.js 대신 app.js에서 서버 구동 => server.js 임시 삭제


module.exports = app;