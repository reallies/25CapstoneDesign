//구글, 네이버, 카카오 로그인 Strategy

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prisma/prismaClient");
const jwtUtils = require("../utils/jwt");

// (공통) 직렬화 / 역직렬화
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// (공통) 사용자 찾기/생성 및 JWT 발급
const findOrCreateUser = async (provider, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { provider_id: profile.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          provider,
          provider_id: profile.id,
          nickname: profile.displayName,
          image_url: profile.photos?.[0]?.value || null,
        },
      });
    }

    console.log("2. 사용자 생성 or 찾기 - user_id: ", user.user_id); 

    //AccessToken은 요청마다 매번 발급 (유효시간이 짧으니까)
    const accessToken = jwtUtils.generateAccessToken(user);
    console.log("3. Access Token 생성 완료:", accessToken);

    //Refresh Token이 있는지 확인 (발급이 되어있는경우는 기존토큰 그대로)
    let refreshToken = user.refresh_token;
    if (!refreshToken){
      refreshToken = jwtUtils.generateRefreshToken(user);
      
      //Refresh Token DB에 저장 - 자동 로그인을 위함
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: refreshToken },
      });
      console.log("4. Refresh Token 생성 완료:", refreshToken);

    }else{
      console.log("4. 기존 Refresh Token 사용 :", refreshToken);
    }

    //passport.authenticate()에 데이터 전달
    return done(null,{ user,accessToken,refreshToken  },{ message: "로그인 성공" });
  } catch (error) {
    return done(error,null);
  }
};

// 구글 로그인 전략
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:"http://localhost:8080/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("1. GOOGLE 전략 실행");

        return findOrCreateUser("GOOGLE",profile,done);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
//네이버 로그인 전략



//카카오 로그인 전략



module.exports = passport;
