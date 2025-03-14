//로그인 & 로그아웃 라우트

const express = require("express");
const passport = require("passport");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");

// (공통) 로그인 처리 함수
const handleAuthCallback = async (req,res)=>{
    try {
        const { accessToken, refreshToken} = req.authInfo;

        // AccessToken & RefreshToken을 쿠키로 저장
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

        res.redirect("http://localhost:3000/"); //로그인 성공후 home으로 이동
    } catch (error) {
        console.error("콜백 처리 중 오류:", error);
        res.status(500).json({ message: "서버 오류" });
    }
};

//구글 로그인
router.get("/google",passport.authenticate("google", {scope: ["profile","email"]}));
router.get("/google/callback",
    passport.authenticate("google",{session:false, failureRedirect: "/"}),
    handleAuthCallback
);

//네이버 로그인
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback",
    passport.authenticate("naver", { session: false, failureRedirect: "/" }),
    handleAuthCallback
);

//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get("/kakao/callback",
    passport.authenticate("kakao", { session: false, failureRedirect: "/" }),
    handleAuthCallback
);

//로그아웃
router.post("/logout",async (req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(400).json({message: "로그인 상태가 아닙니다."});
        
        const exUser = await prisma.user.findFirst({
            where:{refresh_token:refreshToken}
        });
        if(exUser){
            console.log(`로그아웃 하려는 user_id: ${exUser.user_id}`);
            await prisma.user.updateMany({ where: { refresh_token: refreshToken }, data: { refresh_token: null } });
        }else{
            return res.status(400).json({message:"이미 로그아웃된 유저입니다."});
        }

        res.clearCookie("accessToken",{ httpOnly: true, secure: false, sameSite: "Lax" }); //accessToken 삭제
        res.clearCookie("refreshToken",{ httpOnly: true, secure: false, sameSite: "Lax" }); //refreshToken 삭제
        return res.json({message:"로그아웃 성공"});
    }catch(error){
        res.status(500).json({message:"서버 오류"});
    }
});

//AccessToken 재발급
router.post("/refresh",async(req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({message:"Refresh Token 없음"});

        const decoded = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });

        if (!user || user.refresh_token !== refreshToken) {
          return res.status(403).json({ message: "유효하지 않은 Refresh Token" });
        }
        
        const newAccessToken = generateAccessToken(user);

        if (!newAccessToken) {
            return res.status(500).json({ message: "AccessToken 생성 실패" });
        }

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

        res.json({ accessToken: newAccessToken });
      } catch (error) {
        res.status(403).json({ message: "Refresh Token 검증 실패" });
      }
});

module.exports = router;