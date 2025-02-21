//메인 서버
const express = require("express");
const dotenv = require('dotenv');
const passport = require("./src/config/passport");
const cors = require("cors");

// 환경변수 로딩 (.env 파일 사용)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, //쿠키 허용
}));

app.use(require("./app"));

// 간단한 에러 핸들링 미들웨어 (필요 시 확장 가능)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
