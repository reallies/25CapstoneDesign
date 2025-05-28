const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const NaverStrategy = require("passport-naver-v2").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const prisma = require("../../prisma/prismaClient");
const jwtUtils = require("../services/jwtService");

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
    const response = profile._json.response || profile._json || {};
    const properties = profile._json.properties || {}; 
    const imagePaths = {
      GOOGLE: profile.photos?.[0]?.value,
      NAVER: response.profile_image,
      KAKAO: properties.profile_image,
    };
    const imageUrl = imagePaths[provider] || null;

    let user = await prisma.user.findUnique({
      where: { provider_id: profile.id.toString() },
    });

    let isNewUser = false; // 신규 회원 여부 플래그
    if (!user) { 
      // 새로운 유저 생성
      user = await prisma.user.create({
        data: {
          provider,
          provider_id: profile.id.toString(),
          nickname: `temp_${Date.now()}`, // 임시 닉네임
          image_url: imageUrl,
        },
      });
      isNewUser = true; // 신규 회원으로 표시
    }

    //accessToken은 /refresh 라우트에서 발급
    let accessToken = jwtUtils.generateAccessToken(user);

    //Refresh Token이 있는지 확인 (발급이 되어있는경우는 기존토큰 그대로)
    let refreshToken = user.refresh_token;
    if (!refreshToken) {
      refreshToken = jwtUtils.generateRefreshToken(user);

      //Refresh Token DB에 저장 - 자동 로그인을 위함
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: refreshToken },
      });
    }
    
    const authInfo = { accessToken, refreshToken, isNewUser };
    return done(null, user, authInfo); //passport.authenticate()에 데이터 전달
  } catch (error) {
    return done(error,null);
  }
};

// 구글 로그인 전략
passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:"http://localhost:8080/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        return findOrCreateUser("GOOGLE",profile,done);
      } catch (error) {
        console.error("Google 로그인 처리 중 오류 발생:", error);
        return done(error, null);
      }
    }
  )
);

//네이버 로그인 전략
passport.use(new NaverStrategy({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/naver/callback",
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        return findOrCreateUser("NAVER", profile, done);
      } catch (error) {
        console.error("Naver 로그인 처리 중 오류 발생:", error);
        return done(error, null);
      }
    }
  )
);

//카카오 로그인 전략
passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: "http://localhost:8080/auth/kakao/callback",
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        return findOrCreateUser("KAKAO", profile, done);
      } catch (error) {
        console.error("Kakao 로그인 처리 중 오류 발생:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;