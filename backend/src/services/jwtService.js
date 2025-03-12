//JWT 생성 & 검증 함수

const jwt = require("jsonwebtoken");

//Access Token 생성
const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

//Refresh Token 생성
const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, provider: user.provider },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

//Access Token & Refresh Token 검증
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);;
};
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};


module.exports = { generateAccessToken, generateRefreshToken,verifyAccessToken, verifyRefreshToken};