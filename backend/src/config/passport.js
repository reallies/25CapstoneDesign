const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const NaverStrategy = require("passport-naver-v2").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const prisma = require(path.join(__dirname, "../../prisma/prismaClient.js"));
const { generateAccessToken, generateRefreshToken } = require("../../utils/jwt");

passport.serializeUser((user, done) => {
  done(null, user.user_id)
}
);

passport.deserializeUser(async (user_id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const findOrCreateUser = async (provider, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { provider_id: profile.id.toString() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          provider,
          provider_id: profile.id.toString(),
          nickname: profile.displayName || "Unknown",
          image_url: profile.photos?.[0]?.value || null,
        },
      });
    }

    const accessToken = generateAccessToken(user);
    let refreshToken = user.refresh_token || generateRefreshToken(user);
    if (!user.refresh_token) {
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { refresh_token: refreshToken },
      });
    }

    done(null, user, { accessToken, refreshToken });
  } catch (error) {
    console.error(`${provider} 로그인 오류:`, error);
    done(error, null);
  }
};

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => findOrCreateUser("GOOGLE", profile, done)));

passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/naver/callback",
}, (accessToken, refreshToken, profile, done) => {
  profile.displayName = profile._json.nickname || "Unknown";
  profile.photos = [{ value: profile._json.profile_image || null }];
  findOrCreateUser("NAVER", profile, done);
}));

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: "http://localhost:8080/auth/kakao/callback",
}, (accessToken, refreshToken, profile, done) => {
  const props = profile._json.properties || {};
  profile.displayName = props.nickname || "Unknown";
  profile.photos = [{ value: props.profile_image || null }];
  findOrCreateUser("KAKAO", profile, done);
}));

module.exports = passport;