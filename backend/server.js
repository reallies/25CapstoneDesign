//메인 서버

//전역 미들웨어
const app = require("./app");
const dotenv = require('dotenv');
const session = require("express-session");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");

// 환경변수 로딩 (.env 파일 사용)
dotenv.config();

const PORT = process.env.PORT || 8080;

// JSON 요청 파싱 미들웨어
app.use(cookieParser());
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// 간단한 에러 핸들링 미들웨어 (필요 시 확장 가능)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
