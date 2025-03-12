const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// 로그인 페이지로 이동 (Google OAuth 인증 요청)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth 로그인 성공 후, 콜백 처리
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "User authentication failed" });
    }

    // JWT 생성
    const token = jwt.sign(
      { user_id: req.user.user_id, nickname: req.user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 쿠키에 JWT 저장
    res.cookie("accessToken", token, { httpOnly: true, secure: false, sameSite: "Strict" });

    // 로그인 성공 후 프론트엔드 메인 페이지로 리디렉트
    res.redirect("http://localhost:3000/");
  }
);

module.exports = router;
