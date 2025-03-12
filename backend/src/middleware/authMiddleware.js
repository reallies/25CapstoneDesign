//토큰 해독&검증 미들웨어
//isLoggedIn 로그인 여부확인 미들웨어
const prisma = require("../../prisma/prismaClient");
const {verifyAccessToken}=require("../services/jwtService");

const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "Access Token이 필요합니다." });

  try {
    const decoded = verifyAccessToken(token);

    const foundUser = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    if (!foundUser) return res.status(401).json({ message: "User를 찾을 수 없음" });

    req.user = foundUser;
    res.clearCookie("accessToken", {httpOnly: true, secure: false, sameSite: "Lax" }); //accessToken 삭제
    next();
  } catch (error) {
    return res.status(403).json({ message: "잘못된 토큰" });
  }
};

module.exports = { authenticateJWT };