const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");


const router = express.Router();

// 구글 로그인 성공 후 리다이렉트 처리
router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }), 
    (req, res) => {
      const user = req.user;
      const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.cookie("accessToken", token, { httpOnly: true, secure: false, sameSite: "Strict" });
  
      // ✅ 로그인 성공 후 메인 페이지로 리다이렉트
      res.redirect(`http://localhost:8080?nickname=${encodeURIComponent(user.nickname)}`);
    }
  );
  

// 카카오 로그인 성공 후 리다이렉트 처리
router.get("/kakao/callback", 
    passport.authenticate("kakao", { failureRedirect: "/login" }), 
    (req, res) => {
      const user = req.user;
      const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.cookie("accessToken", token, { httpOnly: true, secure: false, sameSite: "Strict" });
  
      // ✅ 로그인 성공 후 메인 페이지로 리다이렉트
      res.redirect(`http://localhost:8080?nickname=${encodeURIComponent(user.nickname)}`);
    }
  );

// 네이버버 로그인 성공 후 리다이렉트 처리
router.get("/naver/callback", 
    passport.authenticate("naver", { failureRedirect: "/login" }), 
    (req, res) => {
      const user = req.user;
      const token = jwt.sign({ user_id: user.user_id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.cookie("accessToken", token, { httpOnly: true, secure: false, sameSite: "Strict" });
  
      // ✅ 로그인 성공 후 메인 페이지로 리다이렉트
      res.redirect(`http://localhost:8080?nickname=${encodeURIComponent(user.nickname)}`);
    }
  );

module.exports = router;
