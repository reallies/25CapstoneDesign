const express = require("express");
const prisma = require("../../prisma/prismaClient");
const router = express.Router();
const { authenticateJWT } = require("../middleware/authMiddleware");
const OpenAI = require("openai");
const axios = require("axios");

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getWeather = async (lat, lon) => {
    const trip = await prisma.trip.findUnique({
        where: {trip_id},
        select: {
            start_date: true,
            end_date: true,
            destinations: true,
        }
    });
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);

    const filteredDays = weatherData.daily.filter((day)=>{
        const date = new Date(day.dt * 1000);
        return date >= start && date <= end;
    })

    try{
        const res = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=kr`
        );

        const badWeather = res.data.list.filter((entry)=>{
            const hour = new Date(entry.dt * 1000).getHours();
            return hour >=9 && hour <=21 && entry.weather.some(w => w.main === "Rain" || w.main === "Snow");
        });

        if(badWeather.length > 0){
            const description = badWeather.map
        }
    } catch(error){

    }
}

router.get("/:trip_id", async(req, res)=>{
    const { trip_id } = req.params;

    try {
        const trip = await prisma.trip.findUnique({
            where: { trip_id },
            include: {
                days: {
                include: {
                    places: {
                    include: {
                        place: true
                    },
                    orderBy: { dayplace_order: "asc" }
                    }
                },
                orderBy: { day_order: "asc" }
                }
            }
        });

        if(!trip) return res.status(404).json({error: "trip 없음"})

        const feedbacks = await Promise.all(
            trip.days.map(async (day)=>{

                if (day.places.length === 0) {
                    return {
                    day: day.day_order,
                    feedback: "DAY " + day.day_order + "에는 아직 방문할 장소가 없습니다. 장소를 추가해보세요!",
                    };
                }
                
                if (day.places.length === 1) {
                    return {
                    day: day.day_order,
                    feedback: `DAY ${day.day_order}에는 '${day.places[0].place.place_name}' 하나만 포함되어 있어 동선 피드백은 어렵습니다. 주변 관광지를 함께 구성해보세요!`,
                    };
                }

                const placeNames = day.places.map((p)=> p.place.place_name);
                const placeAddress = day.places.map((p)=> p.place.place_address);
                const prompt = `
                    다음은 사용자의 DAY ${day.day_order} 일정입니다.
                    장소 목록: ${placeNames.join(", ")}

                    1. 먼저 일반 설명을 1~2문단 작성해줘.
                    2. 마지막 문단은 반드시 핵심 제안이고, 강조할 내용은 [하이라이트]로 감싸줘.

                    ### 요청 사항
                    1. 이동 동선 피드백 — 필수 작성  
                    이동 동선이 비효율적인 경우,더 나은 순서를 제안해 주세요.

                    2. 브레이크 타임 피드백
                    
                    3. [날씨 피드백] — 야외 활동 중 **가장 핵심적인 장소 1곳만** 분석  
                    비/눈/태풍 등 날씨 문제가 있을 경우에만 작성

                    ### 형식
                    다음 JSON 형식으로 응답해주세요. 필요 없는 항목은 null로 남기세요.  
                    전체 분량은 400자 이내로 제한해주세요.


                    다음 JSON 형식에 맞게 피드백을 주세요:
                    {
                        "day": ${day.day_order},
                        "distance_feedback": "동선 관련 피드백이 있다면 여기에 작성",
                        "breaktime_feedback": "브레이크 타임 관련 피드백이 있다면 여기에 작성",
                        "weather_feedback": "날씨 관련 피드백이 있다면 여기에 작성"
                    }

                    각 피드백 항목은 필요할 경우에만 작성하고, 필요 없으면 null을 반환하세요.
                `;

                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {role: "system", content: "너는 여행일정 피드백 전문가야." },
                        {role: "user", content: prompt, }
                    ],
                    temperature: 0.5,
                });

                return {
                    day: day.day_order,
                    feedback: response.choices[0].message.content,
                }
            })
        );

        res.json({ feedbacks });
    } catch (error) {
        console.log(error, "feedback routes 에러");
        res.status(500).json({error: "feedback routes 중 오류"})
    }
});

module.exports = router;