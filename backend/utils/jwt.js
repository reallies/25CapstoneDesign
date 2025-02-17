//JWT 생성 & 검증 함수

const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prismaClient");

//Access Token 생성
const generateAccessToken = (user) => {
  console.log("-- user_id ",user.user_id,"에 대한 Access Token 생성 중");
  return jwt.sign(
    { user_id: user.user_id, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

//Refresh Token 생성
const generateRefreshToken = (user) => {
  console.log("-- user_id ",user.user_id,"에 대한 Refresh Token 생성 중");
  return jwt.sign(
    { user_id: user.user_id, provider: user.provider },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

//Access Token & Refresh Token 검증
const verifyAccessToken = (token) => {
  jwt.verify(token, process.env.JWT_SECRET);
  return jwt.verify(token, process.env.JWT_SECRET);;
};
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};


module.exports = { generateAccessToken, generateRefreshToken,verifyAccessToken, verifyRefreshToken};