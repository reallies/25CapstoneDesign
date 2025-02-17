//미들웨어나 라우트 정의
const express = require("express");
const app = express();
const {authenticateJWT}= require("./middleware/auth");

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

//구글 라우트
const authRoutes=require("./routes/auth/google");
app.use("/auth",authRoutes);

//로그인된 유저 프로필
app.get("/profile",authenticateJWT,(req,res)=>{
    if(!req.user) return res.redirect("/login"); //프론트 로그인 페이지로 리디렉트

    res.json(req.user);
})

module.exports=app;