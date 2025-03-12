const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/naver/callback",
  passport.authenticate("naver", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { user_id: user.user_id, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", token, { httpOnly: true, secure: false, sameSite: "Strict" });

    // 메인 페이지("/")로 이동
    res.redirect("http://localhost:3000/");
  }
);


module.exports = router;