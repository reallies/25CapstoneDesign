const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/kakao", passport.authenticate("kakao"));

router.get("/kakao/callback",
  passport.authenticate("kakao", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      console.log("카카오 로그인 성공, authInfo:", req.authInfo);
      if (!req.user) {
        return res.status(401).json({ message: "카카오 로그인 실패" });
      }

      const { accessToken, refreshToken } = req.authInfo;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });

      res.json({ accessToken });
    } catch (error) {
      console.error("카카오 로그인 콜백 오류:", error);
      res.status(500).json({ message: "/kakao/callback에서의 오류" });
    }
  }
);

module.exports = router;