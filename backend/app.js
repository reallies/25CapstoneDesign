const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const passport = require("./src/config/passport");
const { authenticateJWT } = require("./src/middleware/authMiddleware");


const app = express();

app.use(cors({
  origin: "http://localhost:3000", // React 개발 서버
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
const authRoutes=require("./src/routes/authRoutes");
app.use("/auth",authRoutes);

// 인증된 사용자만 프로필 접근 가능
app.get("/profile", authenticateJWT, (req, res) => res.json(req.user));

//여행&일정 추가
const scheduleRoutes = require("./src/routes/scheduleRoutes");
app.use("/schedule",scheduleRoutes);




// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Server running on port ${PORT}`)); 
//개발환경에서는 server.js 대신 app.js에서 서버 구동 => server.js 임시 삭제


module.exports = app;