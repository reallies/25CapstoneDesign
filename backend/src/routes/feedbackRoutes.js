const express = require("express");
const prisma = require("../../prisma/prismaClient");
const router = express.Router();
const OpenAI = require("openai");
const axios = require("axios");
const fs = require("fs");

const weatherCache = new Map();
const path = require("path");
const csvParser = require("csv-parser");

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// gpt 요청
async function gptRes(prompt){
    const res = await openai.chat. completions.create({
        model: "gpt-4o-mini",
        messages: [
        { role: "system", content: "너는 여행 일정 전문가로, 다음 여행 일정을 보고 친절하고 간단한 피드백을 제공해줘." },
        { role: "user", content: prompt }
    ],
    temperature: 0.5,
    });
    return res.choices[0].message.content;
}

//place_address에서 시/군/구만 추출
function extractRegion(address) {
    if (!address) return "알 수 없음";
    
    const match = address.match(/\s(\S+(구|시|군))/);
    return match ? match[1] : "알 수 없음";
}

//가까운 관측소 id 찾기
async function extractStationsId(avgLat,avgLon){
    const FilePath = path.join(__dirname, "stationsId.csv");
    
    return new Promise((resolve,reject)=>{
        const stations = [];

        fs.createReadStream(FilePath)
            .pipe(csvParser())
            .on("data", (row) => {
                const stnId = row.stnId;
                const lat = parseFloat(row.latitude);
                const lon = parseFloat(row.longitude);

                if (!isNaN(lat) && !isNaN(lon)) {
                    const simpleDist = Math.abs(lat - avgLat) + Math.abs(lon - avgLon);
                    stations.push({ stnId, name: row.name, lat, lon, simpleDist });
                }
            })
            .on("end", () => {
                stations.sort((a, b) => a.simpleDist - b.simpleDist);
                resolve(stations[0]); // 가장 가까운 관측소
            })
            .on("error", reject);
    });
}

//YYYYMMDD로 시간 형태 변경
function changeDateYYYYMMDD(date){
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

//기상청으로 과거날씨 가져오기
async function getPastWeather(region, visitDate, avgLat, avgLon) {
    const saveFilePath = `./weather_past_${region}_${visitDate.toISOString().split("T")[0]}.json`;

    const baseDate = new Date(visitDate);
    baseDate.setDate(baseDate.getDate() - 365); // 작년 같은 날 기준
    const tm = changeDateYYYYMMDD(baseDate);
    
    const nearStations = await extractStationsId(avgLat, avgLon);
    const stnId = nearStations.stnId; 

    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?tm=${tm}&stn=${stnId}&help=1&authKey=${process.env.WEATHER_API_KEY2}`;

    try {
        const res = await axios.get(url);
        const data = res.data;

        fs.writeFileSync(saveFilePath, JSON.stringify(data, null, 2));
        
        const sample = data?.info?.rows?.[0];
        const summary = sample ? `작년(${baseDateStr}) 평균기온 ${sample.avgTa}도, 강수량 ${sample.sumRn}mm` : "기록 없음";

        return {
            message: `8일 이후의 날씨는 예측하기 어렵습니다. 작년 날씨를 참고하세요.\n작년 날씨: ${summary}`
        };
    } catch (error) {
        console.error("기상청 과거 날씨 API 오류:", error.message);
        return [{ message: "기상청 과거 날씨 조회 실패" }];
    }
}

async function getWeather(region, visitDate, regionPlaces) {
    //같은 좌표 + 같은 날짜에 대해 이미 요청했다면 재요청하지 않고 캐시 데이터 사용
    const cacheKey = `${region}:${visitDate.toISOString().split("T")[0]}`;
    if (weatherCache.has(cacheKey)) {
        return weatherCache.get(cacheKey);
    }

    const validPlaces = regionPlaces.filter(p =>
        p.place.place_latitude && p.place.place_longitude &&
        Math.abs(p.place.place_latitude) <= 90 && Math.abs(p.place.place_longitude) <= 180
    );
    if (validPlaces.length === 0) {
        return { message: "유효한 좌표 없음" };
    }

    const avgLat = validPlaces.reduce((sum, p) => sum + p.place.place_latitude, 0) / validPlaces.length;
    const avgLon = validPlaces.reduce((sum, p) => sum + p.place.place_longitude, 0) / validPlaces.length;

    const now = new Date();
    const daysDiff = Math.ceil((visitDate - now) / (1000 * 60 * 60 * 24));

    try {
        if (daysDiff >= 8) {
            const result = await getPastWeather(region, visitDate, avgLat, avgLon);
            weatherCache.set(cacheKey, result);
            return result;
        }

        console.log("Weather 요청:", { region, avgLat, avgLon, visitDate: visitDate.toISOString() });
        const res = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${avgLat}&lon=${avgLon}&exclude=minutely,hourly,current&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=kr`,
            { timeout: 5000 } //5초내로 응답 없으면 요청 중단
        );

        //원하는 날짜 날씨만 추출
        const targetDateStr = visitDate.toISOString().split('T')[0];
        const daily = res.data.daily.find((d) => {
            const dDateStr = new Date(d.dt * 1000).toISOString().split('T')[0];
            return dDateStr === targetDateStr;
        });

        if (!daily) {
            console.warn("날씨 데이터 없음:", { lat: avgLat, lon: avgLon, targetDateStr });
            return { message: "날씨 데이터 없음" };
        }

        const result = {
            description: daily.weather[0].description, //대략적인 날씨
            pop: daily.pop * 100, //강수 확률
            temp: daily.temp.day, // 낮 기온
            isBad: ["Rain", "Snow", "Thunderstorm"].includes(daily.weather[0].main) || daily.pop * 100 >= 50,
        };

        console.log("Weather 결과:", result);
        weatherCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("getWeather 실패:", error.message);
        return { message: "날씨 정보 가져오기 실패" };
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

        const feedbacks = await Promise.all(
            trip.days.map(async (day)=>{
                //고정된 응답 - 일정이 0,1개일 경우
                if (day.places.length === 0) {
                    return {
                    day: day.day_order,
                    feedback: "DAY " + day.day_order + "에는 아직 방문할 장소가 없습니다. 장소를 추가해보세요!",
                    };
                }
                
                if (day.places.length === 1) {
                    return {
                    day: day.day_order,
                    feedback: `DAY ${day.day_order}에는 '${day.places[0].place.place_name}' 하나만 포함되어 있어 피드백은 어렵습니다. 주변 관광지를 함께 구성해보세요!`,
                    };
                }

                //날씨 - 장소별 지역 묶기
                const placeNames = day.places.map((p) => p.place.place_name);
                const regions = day.places.map((p) => extractRegion(p.place.place_address));
                const visitDate = new Date(trip.start_date.getTime() + (day.day_order - 1) * 86400000);
                const regionMap = new Map();
                for (const p of day.places) {
                    const region = extractRegion(p.place.place_address);
                    if (!regionMap.has(region)) {
                        regionMap.set(region, []);
                    }
                    regionMap.get(region).push(p);
                }

                //날씨 - 지역별 평균 좌표 기반 날씨 요청
                const regionWeatherMap = new Map();
                for (const [region, regionPlaces] of regionMap.entries()) {
                    const weather = await getWeather(region, visitDate, regionPlaces);
                    regionWeatherMap.set(region, weather);
                }

                //날씨 - 지역 날씨 정보 return
                const placeFeedbacks = await Promise.all(
                    day.places.map(async (p, i) => {
                        const region = extractRegion(p.place.place_address);
                        const weather = regionWeatherMap.get(region);

                        let feedback = "문제 없음";
                        if (weather.isBad) {
                            feedback = await gptRes(
                                `이 장소는 ${region}의 날씨 정보에 따라 실외 활동에 적합하지 않을 수 있습니다.`
                            );
                        }

                        return {
                            place_name: p.place.place_name,
                            region,
                            weather: weather.message || `${weather.description} (강수확률: ${weather.pop}%)`,
                            feedback,
                        };
                    })
                );

                //날씨 - 안좋은 날씨인 지역만 골라내서 gpt 응답 받기
                const badWeatherPlaces = placeFeedbacks.filter((p) => p.feedback !== "문제 없음");
                let weather_feedback;
                if (badWeatherPlaces.length === 0) {
                        const anyWeather = regionWeatherMap.values().next().value;
                        weather_feedback = `예상 날씨는 "${anyWeather.description}"입니다. 계획된 일정대로 진행하셔도 좋을 것 같아요!.`;
                } else {
                    const problemPlaceDescriptions = badWeatherPlaces
                        .map((p) => `- ${p.place_name} (${p.region}): ${p.weather}. ${p.feedback}`)
                        .join("\n");

                    weather_feedback = await gptRes(
                        `당신은 여행 일정 전문가입니다. DAY ${day.day_order} 일정 중 날씨로 인해 문제가 있는 장소들이 다음과 같습니다:\n${problemPlaceDescriptions}\n이러한 상황을 고려하여 실외 활동에 어떤 영향을 줄 수 있는지 간략히 설명하고, 대체 가능한 실내 장소나 일정을 제안해주세요. 200자 이내로 작성해주세요.`
                    );
                }

                //동선, 브레이크 타임 피드백
                const [distance_feedback, breaktime_feedback] = await Promise.all([
                    gptRes(
                        `DAY ${day.day_order} 장소: ${placeNames.join(", ")}. 지역: ${regions.join(", ")}. 동선 비효율 시 순서 제안. 100자 이내.`
                    ),
                    gptRes(
                        `DAY ${day.day_order} 장소: ${placeNames.join(", ")}. 브레이크 타임 부족 시 쉼터 제안. 200자 이내.`
                    ),
                ]);

                return {
                    day: day.day_order,
                    feedback: {
                        distance_feedback,
                        breaktime_feedback,
                        weather_feedback,
                    },
                    places: placeFeedbacks,
                };
            })
        );

        res.json({ feedbacks });
        } catch (error) {
            console.log(error, "feedback routes 에러");
            res.status(500).json({error: "feedback routes 중 오류"})
        }
});

module.exports = router;