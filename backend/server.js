// server.js
const express = require('express');
const dotenv = require('dotenv');

// 환경변수 로딩 (.env 파일 사용)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 요청 파싱 미들웨어
app.use(express.json());

// 기본 라우터 (예: API 라우트 모듈을 사용할 경우)
app.get('/', (req, res) => {
  res.send('Server is running');
});

// 예시: API 라우터 사용 (src/routes/index.js 등)
// const apiRoutes = require('./src/routes');
// app.use('/api', apiRoutes);

// 간단한 에러 핸들링 미들웨어 (필요 시 확장 가능)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
