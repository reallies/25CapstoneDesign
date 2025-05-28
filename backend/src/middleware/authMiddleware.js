//토큰 해독&검증 미들웨어
//isLoggedIn 로그인 여부확인 미들웨어
const prisma = require("../../prisma/prismaClient");
const {verifyAccessToken}=require("../services/jwtService");

const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Access Token 없음" });

    const decoded = verifyAccessToken(token);

    const foundUser = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    if (!foundUser) return res.status(401).json({ message: "User를 찾을 수 없음" });

    req.user = foundUser;
    next();
  } catch (error) {
    return res.status(403).json({ message: "accessToken 만료됨" });
  }
};

module.exports = { authenticateJWT };