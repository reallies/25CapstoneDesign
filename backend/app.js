//미들웨어나 라우트 정의
const express = require("express");
const cookieParser = require("cookie-parser");
const {authenticateJWT}= require("./src/middleware/auth");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => { res.send('Server is running');});

//소셜 로그인 & 로그아웃
const authRoutes=require("./src/routes/auth/auth");
app.use("/auth",authRoutes);

//로그인된 유저 프로필
app.get("/profile",authenticateJWT,(req,res)=>{
    if(!req.user) return res.status(401).json({message: "로그인이 필요합니다."});
    res.json( req.user);
});


module.exports=app;