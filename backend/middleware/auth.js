//토큰 해독&검증 미들웨어

const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prismaClient");
const {verifyAccessToken}=require("../utils/jwt");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰 없음" });
  }

  const token = authHeader.split(" ")[1]; //헤더에서 token만 추출

  try {
    const decoded = verifyAccessToken(token);
    console.log("6. JWT 정상적으로 해독 완료:", decoded);

    const foundUser = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    if (!foundUser) return res.status(401).json({ message: "User를 찾을 수 없음" });

    req.user = foundUser;
    console.log("7. 유저 정보:", req.user);
    next();
  } catch (error) {
    return res.status(403).json({ message: "잘못된 토큰" });
  }
};

module.exports = { authenticateJWT };