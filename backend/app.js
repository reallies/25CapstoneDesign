const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const authRouter = require("./src/routes/auth/auth");
const passport = require("passport");
const path = require("path");
const prisma = require("./prisma/prismaClient");
const app = express();

const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require("./utils/jwt");
const { authenticateJWT } = require("./middleware/auth");

require("dotenv").config();

// 세션 미들웨어 추가
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Passport 초기화 및 세션 사용 설정
app.use(passport.initialize());
app.use(passport.session());


// 기본 미들웨어
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));


// 기본 페이지 제공
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/build", "index.html")));

// 인증된 사용자만 프로필 접근 가능
app.get("/profile", authenticateJWT, (req, res) => res.json(req.user));


// Refresh Token 갱신 엔드포인트
app.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh Token 없음" });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "유효하지 않은 Refresh Token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { refresh_token: newRefreshToken },
    });

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: false, sameSite: "Strict" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh Token 검증 실패" });
  }
});

// 로그아웃 엔드포인트
app.get("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await prisma.user.updateMany({ where: { refresh_token: refreshToken }, data: { refresh_token: null } });
  }
  res.clearCookie("refreshToken", { httpOnly: true, secure: false, sameSite: "Strict" });
  res.json({ message: "로그아웃 성공" });
});

// OAuth 라우트 정리
authRouter.use("/google", require("./src/routes/auth/google"));
authRouter.use("/naver", require("./src/routes/auth/naver"));
authRouter.use("/kakao", require("./src/routes/auth/kakao"));

app.use("/auth", authRouter);

module.exports = app;