//로그인 & 로그아웃 라우트

const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");

// (공통) 로그인 처리 함수
const handleAuthCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken, isNewUser = false } = req.authInfo || {};

    // 토큰 콘솔 출력 추가 (삭제)
    console.log("AccessToken:", accessToken);

        // AccessToken & RefreshToken을 쿠키로 저장
        res.cookie("accessToken", accessToken, {
            httpOnly: false,//배포 시 변경
            secure: false,
            sameSite: "Lax"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

    if (isNewUser) {
      // 신규 회원이면 강제로 닉네임 설정 페이지로 이동
      res.redirect("http://localhost:3000/set-nickname");
    } else {
      // 기존 회원이면 홈으로 이동
      res.redirect("http://localhost:3000/");
    }
  } catch (error) {
    console.error("콜백 처리 중 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

//구글 로그인
router.get("/google",passport.authenticate("google", {scope: ["profile","email"]}));
router.get("/google/callback",
    passport.authenticate("google",{session:false, failureRedirect: "/"}),
    handleAuthCallback
);

//네이버 로그인
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback",
    passport.authenticate("naver", { session: false, failureRedirect: "/" }),
    handleAuthCallback
);

//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));
router.get("/kakao/callback",
    passport.authenticate("kakao", { session: false, failureRedirect: "/" }),
    handleAuthCallback
);

//로그아웃
router.post("/logout",async (req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(400).json({message: "로그인 상태가 아닙니다."});
        
        const exUser = await prisma.user.findFirst({
            where:{refresh_token:refreshToken}
        });
        if(exUser){
            console.log(`로그아웃 하려는 user_id: ${exUser.user_id}`);
            await prisma.user.updateMany({ where: { refresh_token: refreshToken }, data: { refresh_token: null } });
        }else{
            return res.status(400).json({message:"이미 로그아웃된 유저입니다."});
        }

        res.clearCookie("accessToken",{ httpOnly: true, secure: false, sameSite: "Lax" }); //accessToken 삭제
        res.clearCookie("refreshToken",{ httpOnly: true, secure: false, sameSite: "Lax" }); //refreshToken 삭제
        return res.json({message:"로그아웃 성공"});
    }catch(error){
        res.status(500).json({message:"서버 오류"});
    }
});

//AccessToken 재발급
router.post("/refresh",async(req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({message:"Refresh Token 없음"});

        const decoded = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });

        if (!user || user.refresh_token !== refreshToken) {
          return res.status(403).json({ message: "유효하지 않은 Refresh Token" });
        }
        
        const newAccessToken = generateAccessToken(user);

        if (!newAccessToken) {
            return res.status(500).json({ message: "AccessToken 생성 실패" });
        }

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"
        });

        res.json({ accessToken: newAccessToken });
      } catch (error) {
        res.status(403).json({ message: "Refresh Token 검증 실패" });
      }
});

// 닉네임 설정 라우트
router.post("/set-nickname", authenticateJWT, async (req, res) => {
  try {
    const { nickname } = req.body;
    const user = req.user;

    // 요청값 유효성 검사
    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ message: "닉네임은 문자열로 입력해야 합니다." });
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      return res.status(400).json({ message: "닉네임을 입력해주세요." });
    }

    // 닉네임 형식 검사
    if (!/^[a-z0-9]+$/.test(trimmedNickname)) {
      return res.status(400).json({
        message: "닉네임은 영어 소문자와 숫자만 포함할 수 있습니다.",
      });
    }

    if (trimmedNickname.length < 3 || trimmedNickname.length > 15) {
      return res.status(400).json({
        message: "닉네임은 3자 이상 15자 이하여야 합니다.",
      });
    }

    // 중복 검사
    const existingUser = await prisma.user.findFirst({
      where: { nickname: trimmedNickname },
    });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 닉네임입니다." });
    }

    // 사용자 정보 업데이트
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { nickname: trimmedNickname },
    });

    res.json({ message: "닉네임이 성공적으로 설정되었습니다." });
  } catch (error) {
    console.error("닉네임 설정 중 오류:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "인증 토큰이 유효하지 않습니다." });
    }
    res.status(500).json({ message: "서버 오류가 발생했습니다. 다시 시도해주세요." });
  }
});

// 친구 요청 보내기
router.post("/friendship/request", authenticateJWT, async (req, res) => {
  try {
    const { recipient_nickname } = req.body;
    const requester = req.user; // 현재 로그인한 사용자

    if (!recipient_nickname || typeof recipient_nickname !== "string") {
      return res.status(400).json({ message: "수신자 닉네임을 입력해주세요." });
    }

    // 자신에게 요청 방지
    if (recipient_nickname === requester.nickname) {
      return res.status(400).json({ message: "자신에게 친구 요청을 보낼 수 없습니다." });
    }

    // 수신자 찾기
    const recipient = await prisma.user.findUnique({
      where: { nickname: recipient_nickname },
    });
    if (!recipient) {
      return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
    }

    // 기존 요청 확인
    const existingRequest = await prisma.friendship.findFirst({
      where: {
        requester_id: requester.user_id,
        recipient_id: recipient.user_id,
      },
    });
    if (existingRequest) {
      return res.status(400).json({ message: "이미 친구 요청을 보냈습니다." });
    }

    // 친구 요청 생성
    const friendship = await prisma.friendship.create({
      data: {
        requester_id: requester.user_id,
        recipient_id: recipient.user_id,
        status: "PENDING",
      },
    });

    res.status(201).json({ message: "친구 요청이 성공적으로 전송되었습니다.", friendship });
  } catch (error) {
    console.error("친구 요청 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 요청 수락
router.put("/friendship/accept", authenticateJWT, async (req, res) => {
  try {
    const { friendship_id } = req.body;
    const user = req.user;

    if (!friendship_id || isNaN(friendship_id)) {
      return res.status(400).json({ message: "유효한 친구 요청 ID를 입력해주세요." });
    }

    // 요청 찾기
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendship_id) },
    });
    if (!friendship) {
      return res.status(404).json({ message: "친구 요청을 찾을 수 없습니다." });
    }

    // 요청 수신자 확인
    if (friendship.recipient_id !== user.user_id) {
      return res.status(403).json({ message: "이 요청을 수락할 권한이 없습니다." });
    }

    // 이미 처리된 요청 확인
    if (friendship.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 요청입니다." });
    }

    // 요청 수락
    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendship_id) },
      data: { status: "ACCEPTED" },
    });

    res.json({ message: "친구 요청이 수락되었습니다.", friendship: updatedFriendship });
  } catch (error) {
    console.error("친구 요청 수락 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 요청 거절
router.put("/friendship/reject", authenticateJWT, async (req, res) => {
  try {
    const { friendship_id } = req.body;
    const user = req.user;

    if (!friendship_id || isNaN(friendship_id)) {
      return res.status(400).json({ message: "유효한 친구 요청 ID를 입력해주세요." });
    }

    // 요청 찾기
    const friendship = await prisma.friendship.findUnique({
      where: { id: parseInt(friendship_id) },
    });
    if (!friendship) {
      return res.status(404).json({ message: "친구 요청을 찾을 수 없습니다." });
    }

    // 요청 수신자 확인
    if (friendship.recipient_id !== user.user_id) {
      return res.status(403).json({ message: "이 요청을 거절할 권한이 없습니다." });
    }

    // 이미 처리된 요청 확인
    if (friendship.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 요청입니다." });
    }

    // 요청 거절
    const updatedFriendship = await prisma.friendship.update({
      where: { id: parseInt(friendship_id) },
      data: { status: "REJECTED" },
    });

    res.json({ message: "친구 요청이 거절되었습니다.", friendship: updatedFriendship });
  } catch (error) {
    console.error("친구 요청 거절 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 친구 목록 조회
router.get("/friendship/list", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    // 사용자가 requester_id 또는 recipient_id인 ACCEPTED 상태의 친구 관계 조회
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requester_id: user.user_id },
          { recipient_id: user.user_id },
        ],
        status: "ACCEPTED",
      },
      include: {
        User_Friendship_requester_idToUser: { // 요청자 정보
          select: { user_id: true, nickname: true, image_url: true }
        },
        User_Friendship_recipient_idToUser: { // 수신자 정보
          select: { user_id: true, nickname: true, image_url: true }
        },
      },
    });

    // 친구 목록 정리
    const friends = friendships.map(friendship => {
      if (friendship.requester_id === user.user_id) {
        return {
          user_id: friendship.recipient_id,
          nickname: friendship.User_Friendship_recipient_idToUser.nickname,
          image_url: friendship.User_Friendship_recipient_idToUser.image_url,
        };
      } else {
        return {
          user_id: friendship.requester_id,
          nickname: friendship.User_Friendship_requester_idToUser.nickname,
          image_url: friendship.User_Friendship_requester_idToUser.image_url,
        };
      }
    });

    res.json({ message: "친구 목록 조회 성공", friends });
  } catch (error) {
    console.error("친구 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 받은 PENDING 친구 요청 목록 조회
router.get("/friendship/pending", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    // 사용자가 recipient_id인 PENDING 상태의 친구 요청 조회
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        recipient_id: user.user_id,
        status: "PENDING",
      },
      include: {
        User_Friendship_requester_idToUser: { // 요청자 정보 포함
          select: { user_id: true, nickname: true, image_url: true },
        },
      },
    });

    // 요청 목록 정리
    const requests = pendingRequests.map(request => ({
      friendship_id: request.id,
      requester_id: request.requester_id,
      requester_nickname: request.User_Friendship_requester_idToUser.nickname,
      requester_image_url: request.User_Friendship_requester_idToUser.image_url,
      created_at: request.created_at,
    }));

    res.json({ message: "받은 친구 요청 목록 조회 성공", pendingRequests: requests });
  } catch (error) {
    console.error("받은 친구 요청 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 보내기
router.post("/trip/invite", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, invited_nickname } = req.body;
    const inviter = req.user; // 초대하는 사용자

    // 요청값 유효성 검사
    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (!invited_nickname || typeof invited_nickname !== "string") {
      return res.status(400).json({ message: "초대할 사용자의 닉네임을 입력해주세요." });
    }

    // 자신에게 초대 방지
    if (invited_nickname === inviter.nickname) {
      return res.status(400).json({ message: "자신을 일정에 초대할 수 없습니다." });
    }

    // 일정 존재 여부 및 소유자 확인
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
    });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }
    if (trip.user_id !== inviter.user_id) {
      return res.status(403).json({ message: "이 일정을 초대할 권한이 없습니다." });
    }

    // 초대받을 사용자 찾기
    const invitedUser = await prisma.user.findUnique({
      where: { nickname: invited_nickname },
    });
    if (!invitedUser) {
      return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
    }

    // 기존 초대 확인
    const existingInvitation = await prisma.tripInvitation.findFirst({
      where: {
        trip_id,
        invited_user_id: invitedUser.user_id,
      },
    });
    if (existingInvitation) {
      return res.status(400).json({ message: "이미 이 사용자를 초대했습니다." });
    }

    // 일정 초대 생성
    const invitation = await prisma.tripInvitation.create({
      data: {
        trip_id,
        invited_user_id: invitedUser.user_id,
        status: "PENDING",
        permission: "editor", // 기본 권한: 편집자
      },
    });

    res.status(201).json({ message: "일정 초대가 성공적으로 전송되었습니다.", invitation });
  } catch (error) {
    console.error("일정 초대 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 보내기
router.post("/trip/invite", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, invited_nickname } = req.body;
    const inviter = req.user; // 초대하는 사용자

    // 요청값 유효성 검사
    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (!invited_nickname || typeof invited_nickname !== "string") {
      return res.status(400).json({ message: "초대할 사용자의 닉네임을 입력해주세요." });
    }

    // 자신에게 초대 방지
    if (invited_nickname === inviter.nickname) {
      return res.status(400).json({ message: "자신을 일정에 초대할 수 없습니다." });
    }

    // 일정 존재 여부 및 소유자 확인
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
    });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }
    if (trip.user_id !== inviter.user_id) {
      return res.status(403).json({ message: "이 일정을 초대할 권한이 없습니다." });
    }

    // 초대받을 사용자 찾기
    const invitedUser = await prisma.user.findUnique({
      where: { nickname: invited_nickname },
    });
    if (!invitedUser) {
      return res.status(404).json({ message: "해당 닉네임의 사용자를 찾을 수 없습니다." });
    }

    // 기존 초대 확인
    const existingInvitation = await prisma.tripInvitation.findFirst({
      where: {
        trip_id,
        invited_user_id: invitedUser.user_id,
      },
    });
    if (existingInvitation) {
      return res.status(400).json({ message: "이미 이 사용자를 초대했습니다." });
    }

    // 일정 초대 생성
    const invitation = await prisma.tripInvitation.create({
      data: {
        trip_id,
        invited_user_id: invitedUser.user_id,
        status: "PENDING",
        permission: "editor", // 기본 권한: 편집자
      },
    });

    res.status(201).json({ message: "일정 초대가 성공적으로 전송되었습니다.", invitation });
  } catch (error) {
    console.error("일정 초대 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 수락
router.put("/trip/invite/accept", authenticateJWT, async (req, res) => {
  try {
    const { invitation_id } = req.body;
    const user = req.user;

    if (!invitation_id || typeof invitation_id !== "string") {
      return res.status(400).json({ message: "유효한 초대 ID를 입력해주세요." });
    }

    // 초대 찾기
    const invitation = await prisma.tripInvitation.findUnique({
      where: { invitation_id },
    });
    if (!invitation) {
      return res.status(404).json({ message: "초대를 찾을 수 없습니다." });
    }

    // 초대 수신자 확인
    if (invitation.invited_user_id !== user.user_id) {
      return res.status(403).json({ message: "이 초대를 수락할 권한이 없습니다." });
    }

    // 이미 처리된 초대 확인
    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 초대입니다." });
    }

    // 초대 수락
    const updatedInvitation = await prisma.tripInvitation.update({
      where: { invitation_id },
      data: { status: "ACCEPTED" },
    });

    res.json({ message: "일정 초대가 수락되었습니다.", invitation: updatedInvitation });
  } catch (error) {
    console.error("일정 초대 수락 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 초대 거절
router.put("/trip/invite/reject", authenticateJWT, async (req, res) => {
  try {
    const { invitation_id } = req.body;
    const user = req.user;

    if (!invitation_id || typeof invitation_id !== "string") {
      return res.status(400).json({ message: "유효한 초대 ID를 입력해주세요." });
    }

    // 초대 찾기
    const invitation = await prisma.tripInvitation.findUnique({
      where: { invitation_id },
    });
    if (!invitation) {
      return res.status(404).json({ message: "초대를 찾을 수 없습니다." });
    }

    // 초대 수신자 확인
    if (invitation.invited_user_id !== user.user_id) {
      return res.status(403).json({ message: "이 초대를 거절할 권한이 없습니다." });
    }

    // 이미 처리된 초대 확인
    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "이미 처리된 초대입니다." });
    }

    // 초대 거절
    const updatedInvitation = await prisma.tripInvitation.update({
      where: { invitation_id },
      data: { status: "REJECTED" },
    });

    res.json({ message: "일정 초대가 거절되었습니다.", invitation: updatedInvitation });
  } catch (error) {
    console.error("일정 초대 거절 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 받은 PENDING 초대 목록 조회
router.get("/trip/invite/pending", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;

    // 사용자가 invited_user_id인 PENDING 상태의 초대 조회
    const pendingInvitations = await prisma.tripInvitation.findMany({
      where: {
        invited_user_id: user.user_id,
        status: "PENDING",
      },
      include: {
        Trip: { // 초대된 일정 정보
          select: { trip_id: true, title: true, user_id: true },
        },
        User: { // 초대한 사용자 정보
          select: { user_id: true, nickname: true, image_url: true },
        },
      },
    });

    // 초대 목록 정리
    const invitations = pendingInvitations.map(invitation => ({
      invitation_id: invitation.invitation_id,
      trip_id: invitation.trip_id,
      trip_title: invitation.Trip.title,
      inviter_id: invitation.Trip.user_id,
      inviter_nickname: invitation.User.nickname,
      inviter_image_url: invitation.User.image_url,
      permission: invitation.permission,
      created_at: invitation.created_at,
    }));

    res.json({ message: "받은 초대 목록 조회 성공", pendingInvitations: invitations });
  } catch (error) {
    console.error("받은 초대 목록 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 조회 API
router.get("/trip/:trip_id", authenticateJWT, async (req, res) => {
  try {
    const { trip_id } = req.params;
    const user = req.user;

    const trip = await prisma.trip.findUnique({
      where: { trip_id },
    });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    // 소유자 또는 초대받은 사용자만 접근 가능
    const isOwner = trip.user_id === user.user_id;
    const invitation = await prisma.tripInvitation.findFirst({
      where: {
        trip_id,
        invited_user_id: user.user_id,
        status: "ACCEPTED",
      },
    });
    if (!isOwner && !invitation) {
      return res.status(403).json({ message: "이 일정에 접근할 권한이 없습니다." });
    }

    res.json({ message: "일정 조회 성공", trip });
  } catch (error) {
    console.error("일정 조회 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 일정 수정 (version 관리, 낙관적 락으로 동시 편집 시 덮어쓰기 방지)
router.put("/trip/update", authenticateJWT, async (req, res) => {
  try {
    const { trip_id, title, start_date, end_date, destinations, is_shared, companion_type, theme, version } = req.body;
    const user = req.user;

    if (!trip_id || typeof trip_id !== "string") {
      return res.status(400).json({ message: "유효한 일정 ID를 입력해주세요." });
    }
    if (typeof version !== "number") {
      return res.status(400).json({ message: "현재 버전을 입력해주세요." });
    }

    // 일정 존재 여부 확인
    const trip = await prisma.trip.findUnique({
      where: { trip_id },
    });
    if (!trip) {
      return res.status(404).json({ message: "해당 일정을 찾을 수 없습니다." });
    }

    // 권한 체크
    const isOwner = trip.user_id === user.user_id;
    let hasEditorPermission = false;
    if (!isOwner) {
      const invitation = await prisma.tripInvitation.findFirst({
        where: {
          trip_id,
          invited_user_id: user.user_id,
          status: "ACCEPTED",
        },
      });
      hasEditorPermission = invitation && invitation.permission === "editor";
      if (!hasEditorPermission) {
        return res.status(403).json({ message: "이 일정을 수정할 권한이 없습니다." });
      }
    }

    // 버전 체크
    if (trip.version !== version) {
      return res.status(409).json({
        message: "일정이 다른 사용자에 의해 수정되었습니다.",
        currentVersion: trip.version,
        trip: trip // 현재 상태 반환
      });
    }

    // 수정 데이터 준비
    const updateData = { version: trip.version + 1 };
    if (title) updateData.title = title;
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);
    if (destinations) updateData.destinations = destinations;
    if (is_shared) updateData.is_shared = is_shared;
    if (companion_type) updateData.companion_type = companion_type;
    if (theme) updateData.theme = theme;

    // 일정 수정
    const updatedTrip = await prisma.trip.update({
      where: { trip_id },
      data: updateData,
    });

    res.json({ message: "일정이 성공적으로 수정되었습니다.", trip: updatedTrip });
  } catch (error) {
    console.error("일정 수정 중 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;