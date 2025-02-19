const express = require("express");
const passport=require("passport");

const router=express.Router();

router.get("/google",passport.authenticate("google", {scope: ["profile","email"]}));

router.get("/google/callback",
    passport.authenticate("google",{session:false, failureRedirect: "/login"}),
    async(req,res)=>{
        try {
            console.log("5. auth/google에서 전달받기 완료, authInfo: ", req.authInfo);
            if (!req.user) {
                return res.status(401).json({ message: "구글 로그인 실패" });
            }

           //기존에 생성된 Access Token & Refresh Token 사용
           const { accessToken, refreshToken } = req.authInfo;

            // Refresh Token을 HttpOnly 쿠키에 저장 - 보안 강화를 위함
            res.cookie("refreshToken", refreshToken, { 
                httpOnly: true, 
                secure: false, 
                sameSite: "Strict" 
            });
           
            res.json({ accessToken });
        } catch (error) {
            console.error("구글 로그인 콜백 오류:", error);
            res.status(500).json({ message: "/google/callback에서의 오류" });
        }
    }
);

module.exports = router;