//로그인 & 로그아웃 한 파일에서 관리

const express = require("express");
const passport = require("passport");
const router = express.Router();
const prisma = require("../../../prisma/prismaClient");
const app = require("../../../app");

//구글 로그인
router.get("/google",passport.authenticate("google", {scope: ["profile","email"]}));
router.get("/google/callback",
    passport.authenticate("google",{session:false, failureRedirect: "/"}),
    async(req,res)=>{
        // Refresh Token을 HttpOnly 쿠키에 저장 - 보안 강화를 위함
        res.cookie("refreshToken", req.authInfo.refreshToken, { 
            httpOnly: true, 
            secure: false, 
            sameSite: "Strict" 
        });
        res.json({ accessToken:req.authInfo.accessToken });
    }
);

//네이버 로그인
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback",
    passport.authenticate("naver", { session: false, failureRedirect: "/" }),
    async (req, res) => {
        res.cookie("refreshToken", req.authInfo.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });
        res.json({ accessToken:req.authInfo.accessToken });
    }
);

//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get("/kakao/callback",
    passport.authenticate("kakao", { session: false, failureRedirect: "/" }),
    async (req, res) => {
        res.cookie("refreshToken", req.authInfo.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });
        res.json({ accessToken:req.authInfo.accessToken });
    }
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
            console.log(`로그아웃 하려는 user_id: ${prisma.user_id}`);
            await prisma.user.updateMany({ where: { refresh_token: refreshToken }, data: { refresh_token: null } });
        }else{
            return res.status(400).json({message:"이미 로그아웃된 유저입니다."});
        }

        res.clearCookie("refreshToken",{ httpOnly: true, secure: false, sameSite: "Strict" }); //refreshToken 삭제
        return res.json({message:"로그아웃 성공"});
    }catch(error){
        res.status(500).json({message:"서버 오류"});
    }
});

//AccessToken이 만료 될때만 호출하면 됨
router.post("/refresh",async(req,res)=>{
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({message:"Refresh Token 없음"});

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
        if (!user || user.refresh_token !== refreshToken) {
          return res.status(403).json({ message: "유효하지 않은 Refresh Token" });
        }
    
        //기존 refreshToken 폐기
        await prisma.user.update({
            where: { user_id: user.user_id },
            data: { refresh_token: null },
          });

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

module.exports = router;