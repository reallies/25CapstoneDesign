const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const app = require("./app");
const passport = require("./src/config/passport");
const authRoutes = require("./src/routes/auth/auth");
const router = require("./src/routes/auth/auth");


dotenv.config();
const PORT = process.env.PORT || 8080;

// ✅ API 라우트가 먼저 실행되어야 함
app.use("/auth", require("./src/routes/auth/google"));
app.use("/auth", require("./src/routes/auth/kakao"));
app.use("/auth", require("./src/routes/auth/naver"));


app.use(express.static(path.join(__dirname, "../frontend/build"), {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }
}));


// 모든 GET 요청을 React의 `index.html`로 응답 (SPA) 
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.use("/auth", authRoutes);

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 서버 실행
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// 로그인 성공 후 토큰 발급
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, "JWT_SECRET_KEY", { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("http://localhost:3000");
  }
);