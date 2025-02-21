//토큰 해독&검증 미들웨어
//isLoggedIn 로그인 여부확인 미들웨어
const prisma = require("../../prisma/prismaClient");
const {verifyAccessToken}=require("../utils/jwt");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰 없음" });
  }

  const token = authHeader.split(" ")[1];   //헤더에서 token만 추출

  try {
    const decoded = verifyAccessToken(token);
    console.log("JWT 정상적으로 해독 완료:", decoded);

    const foundUser = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
    if (!foundUser) return res.status(401).json({ message: "User를 찾을 수 없음" });

    req.user = foundUser;
    console.log("유저 정보:", req.user);
    next();
  } catch (error) {
    return res.status(403).json({ message: "잘못된 토큰" });
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next(); // 로그인 상태면 다음 미들웨어 호출
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('이미 로그인 한 상태입니다.');
    res.redirect(`?error=${message}`);
  }
};

module.exports = { authenticateJWT };