const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/prismaClient");
const { authenticateJWT } = require("../middleware/authMiddleware");
const OpenAI = require("openai");
const axios = require("axios");

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// KakaoMap API 설정
const KAKAO_API_KEY = process.env.KAKAO_CLIENT_ID;

// 사용자별 대화 기록 (메모리)
const sessionData = {};

// 장소 검색 API (KakaoMap 결과 반환)
router.post("/search-places", authenticateJWT, async (req, res) => {
  try {
    const { input } = req.body;
    const userId = req.user.user_id;

    if (!input || typeof input !== "string") {
      return res.status(400).json({ message: "유효한 입력 문장을 제공해주세요." });
    }

    // 사용자 세션 초기화
    if (!sessionData[userId]) {
      sessionData[userId] = [];
    }

    // 현재 입력 추가
    sessionData[userId].push({ role: "user", content: input });

    // OpenAI로 키워드 추출 (맥락 유지)
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "사용자의 입력 문장에서 장소 검색에 사용할 주요 키워드(명사)를 추출해 JSON 형식으로 반환해 주세요. 이전 대화를 참고해서 맥락을 유지하며, 예: '서울에서 맛있는 한식을 먹고 싶어요' -> {\"keywords\": [\"서울\", \"한식\"]}, '부산도 추천해줘' -> {\"keywords\": [\"부산\", \"한식\"]}",
        },
        ...sessionData[userId],
      ],
      temperature: 0.5,
    });

    const { keywords } = JSON.parse(openaiResponse.choices[0].message.content);

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ message: "검색할 키워드가 없습니다." });
    }

    // KakaoMap API 호출
    const kakaoResponse = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      params: { query: keywords.join(" "), size: 5 },
    });

    const places = kakaoResponse.data.documents.map(doc => ({
      place_name: doc.place_name,
      address_name: doc.address_name,
      x: doc.x,
      y: doc.y,
    }));

    // OpenAI 응답을 대화 기록에 추가
    sessionData[userId].push({
      role: "assistant",
      content: openaiResponse.choices[0].message.content,
    });

    res.json({
      message: "장소 검색 성공",
      keywords,
      places,
      conversation: sessionData[userId],
    });
  } catch (error) {
    console.error("장소 검색 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 여행 정보 API (OpenAI 답변 반환)
router.post("/travel-info", authenticateJWT, async (req, res) => { //여행 경로 추천 (/chatbot/recommend-route) / 날씨 기반 액티비티 추천 (/chatbot/weather-activity)
  try {
    const { input } = req.body;
    const userId = req.user.user_id;

    if (!input || typeof input !== "string") {
      return res.status(400).json({ message: "유효한 입력 문장을 제공해주세요." });
    }

    // 사용자 세션 초기화 (공통 세션 사용)
    if (!sessionData[userId]) {
      sessionData[userId] = [];
    }

    // 현재 입력 추가
    sessionData[userId].push({ role: "user", content: input });

    // OpenAI로 여행 정보 생성 (맥락 유지)
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "사용자의 요청에 따라 여행 계획, 동선, 추천 여행지 정보, 날씨에 맞는 액티비티 등을 제안해 주세요. 이전 대화를 참고해서 맥락을 유지하며, 자연스럽고 유용한 응답을 제공하세요.",
        },
        ...sessionData[userId],
      ],
      temperature: 0.7,
    });

    const travelInfo = openaiResponse.choices[0].message.content;

    // OpenAI 응답을 대화 기록에 추가
    sessionData[userId].push({
      role: "assistant",
      content: travelInfo,
    });

    res.json({
      message: "여행 정보 제공",
      travelInfo,
      conversation: sessionData[userId],
    });
  } catch (error) {
    console.error("여행 정보 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 세션 초기화 (공통 세션)
router.post("/reset-session", authenticateJWT, async (req, res) => {
  const userId = req.user.user_id;
  delete sessionData[userId];
  res.json({ message: "세션이 초기화되었습니다." });
});

module.exports = router;