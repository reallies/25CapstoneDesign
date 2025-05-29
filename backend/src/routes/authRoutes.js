//로그인 & 로그아웃 라우트

const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// (공통) 로그인 처리 함수
const handleAuthCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken, isNewUser = false } = req.authInfo || {};

        // AccessToken & RefreshToken을 쿠키로 저장
        res.cookie("accessToken", accessToken, {
            httpOnly: false,
            secure: false,
            sameSite: "Lax"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

    if (isNewUser) {
      // 신규 회원이면 강제로 닉네임 설정 페이지로 이동
      res.redirect(`${FRONTEND_URL}/set-nickname`);
    } else {
      // 기존 회원이면 홈으로 이동
      res.redirect(`${FRONTEND_URL}/`);
    }
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

//닉네임 유효성 검사, 중복 체크 라우트
router.post("/check-nickname",authenticateJWT, async (req, res) => {
  try {
    const { nickname } = req.body;

    // 요청값 유효성 검사
    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ message: "닉네임은 문자열로 입력해야 합니다." });
    }

    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      return res.status(400).json({ message: "닉네임을 입력해주세요." });
    }

    // 닉네임 형식 검사
    if (!/^[a-z0-9]+$/.test(trimmedNickname)) {
      return res.status(400).json({
        message: "닉네임은 영어 소문자와 숫자만 포함할 수 있습니다.",
      });
    }

    // DB 중복 체크
    const existing = await prisma.user.findFirst({
      where: { nickname: trimmedNickname },
    });

    if (existing) {
      return res.status(200).json({ available: false, message: "중복 닉네임" });
    }

    return res.status(200).json({ available: true });
  } catch (err) {
    console.error("닉네임 중복 검사 오류:", err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 닉네임 생성 라우트
router.post("/set-nickname", authenticateJWT, async (req, res) => {
  try {
    const { nickname } = req.body;
    const user = req.user;

    const trimmedNickname = nickname.trim();

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { nickname: trimmedNickname },
    });

    res.json({ message: "닉네임이 성공적으로 설정되었습니다." });
  } catch (error) {
    console.error("닉네임 설정 중 오류:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "인증 토큰이 유효하지 않습니다." });
    }
    res.status(500).json({ message: "서버 오류가 발생했습니다. 다시 시도해주세요." });
  }
});

module.exports = router;