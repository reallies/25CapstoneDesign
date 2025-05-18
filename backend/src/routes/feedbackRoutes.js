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

//거리피드백
async function getDistanceFeedback(day) {
    const placeNames = day.places.map(p => p.place.place_name);
    const regions = day.places.map(p => extractRegion(p.place.place_address));
    return await gptRes(`DAY ${day.day_order} 장소: ${placeNames.join(", ")}. 지역: ${regions.join(", ")}. 동선 비효율 시 순서 제안. 100자 이내.`);
}

//브레이크 타임 피드백
async function getBreaktimeFeedback(day) {
    const placeNames = day.places.map(p => p.place.place_name);
    return await gptRes(`DAY ${day.day_order} 장소: ${placeNames.join(", ")}. 브레이크 타임 부족 시 쉼터 제안. 200자 이내.`);
}



// =============================날씨 ==============================
//과거 날씨 데이터 저장 폴더
const dir=path.join(__dirname, '../../public/weather_data');
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive: true});
}

//place_address에서 시/군/구만 추출
function extractRegion(address) {
    if (!address) return "알 수 없음";
    
    const match = address.match(/\s(\S+(구|시|군))/);
    return match ? match[1] : "알 수 없음";
}

//가까운 관측소 id 찾기
async function extractStationsId(avgLat,avgLon){
    const FilePath = path.join(__dirname, "../../public/stationsId.csv");
    
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

//기상청 api 
async function getWeatherFromKMA(region, visitDate, avgLat, avgLon) {
    const saveFilePath = path.join(dir, `weather_past_${region}_${visitDate.toISOString().split("T")[0]}.csv`);

    const baseDate = new Date(visitDate);
    baseDate.setDate(baseDate.getDate() - 365); // 작년 같은 날 기준
    const tm = changeDateYYYYMMDD(baseDate);

    const nearStations = await extractStationsId(avgLat, avgLon);
    const stnId = nearStations.stnId;

    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?tm=${tm}&stn=${stnId}&help=1&authKey=${process.env.WEATHER_API_KEY2}`;

    try {
        const res = await axios.get(url);
        const data = res.data;

        fs.writeFileSync(saveFilePath, data);

        const lines = data.split('\n');
        const dataLine = lines.find((line) => /^\d{8},/.test(line));
        if (!dataLine) return { summary: "날씨 데이터 탐색 실패", gpt: "" };

        const fields = dataLine.split(',');
        const safe = (val) => val === '-9.0' || val === '-9' ? '정보 없음' : val;

        const parsed = {
            maxTemp: safe(fields[11]),
            minTemp: safe(fields[13]),
        };

       const summary = {
            main: "8일 이후 날씨 예보는 어렵습니다. 작년 날씨를 참고하세요.",
            maxTemp: `${parsed.maxTemp}℃`,
            minTemp: `${parsed.minTemp}℃`
        };

        const prompt = `작년 최고 ${parsed.maxTemp}도, 최저 ${parsed.minTemp}도의 날씨였어요. 야외 활동에 적합했는지 간단히 설명해주세요.`;
        const gpt = await gptRes(prompt);

        return { summary, gpt };
    } catch (error) {
        console.error("기상청 과거 날씨 API 오류:", error.message);
        return { summary: "기상청 과거 날씨 조회 실패", gpt: "" };
    }
}

//오픈 날씨 api
async function getWeatherFromOpenWeather(region, visitDate, avgLat, avgLon) {
    try {
        const res = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${avgLat}&lon=${avgLon}&exclude=minutely,hourly,current&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=kr`,
            { timeout: 5000 }
        );

        const targetDateStr = visitDate.toISOString().split('T')[0];
        const daily = res.data.daily.find((d) =>
            new Date(d.dt * 1000).toISOString().split('T')[0] === targetDateStr
        );

        if (!daily) return { summary: "날씨 데이터 없음", gpt: "" };

        const summary = {
            main: daily.weather[0].description,        // 예: "튼구름"
            maxTemp: `${daily.temp.max}℃`,             // 예: "25.4℃"
            minTemp: `${daily.temp.min}℃`,            // 예: "16.2℃"
        };
        const prompt = `해당 날씨는 ${daily.weather[0].description}, 최고 ${daily.temp.max}도 최저 ${daily.temp.min}도입니다. 여행 일정에 어떤 영향을 줄 수 있을까요? 1~2문장으로 간단히 알려줘.`;
        const gpt = await gptRes(prompt);

        return { summary, gpt };
    } catch (error) {
        console.error("OpenWeather 날씨 API 오류:", error.message);
        return { summary: "날씨 정보 가져오기 실패", gpt: "" };
    }
}

async function getWeatherFeedback(day, tripStartDate) {
    //같은 좌표 + 같은 날짜에 대해 이미 요청했다면 재요청하지 않고 캐시 데이터 사용
    const visitDate = new Date(tripStartDate.getTime() + (day.day_order - 1) * 86400000);
    const regionMap = new Map();
    
    for (const p of day.places) {
        const region = extractRegion(p.place.place_address);
        if (!regionMap.has(region)) regionMap.set(region, []);
        regionMap.get(region).push(p);
    }
    
    const regionWeatherMap = new Map();
    for (const [region, regionPlaces] of regionMap.entries()) {
        const avgLat = regionPlaces.reduce((s, p) => s + p.place.place_latitude, 0) / regionPlaces.length;
        const avgLon = regionPlaces.reduce((s, p) => s + p.place.place_longitude, 0) / regionPlaces.length;

        const cacheKey = `${region}:${visitDate.toISOString().split("T")[0]}`;
        if (weatherCache.has(cacheKey)) {
        regionWeatherMap.set(region, weatherCache.get(cacheKey));
        continue;
    }

        const daysDiff = Math.ceil((visitDate - new Date()) / (1000 * 60 * 60 * 24));
        const weather = daysDiff >= 8
            ? await getWeatherFromKMA(region, visitDate, avgLat, avgLon)
            : await getWeatherFromOpenWeather(region, visitDate, avgLat, avgLon);

        weatherCache.set(cacheKey, weather);
        regionWeatherMap.set(region, weather);
    }

    // 장소별 피드백 구성
    const placeFeedbacks = await Promise.all(
        day.places.map(async (p) => {
            const region = extractRegion(p.place.place_address);
            const weather = regionWeatherMap.get(region);
            const feedback = weather.isBad
                ? await gptRes(`이 장소는 ${region}의 날씨 정보에 따라 실외 활동에 적합하지 않을 수 있습니다.`)
                : "문제 없음";

            return {
                place_name: p.place.place_name,
                region,
                weather: `${weather.summary}\n${weather.gpt}`,
                feedback,
            };
        })
    );

    // DAY 전체 날씨 총평
    const badWeatherPlaces = placeFeedbacks.filter(p => p.feedback !== "문제 없음");
    let weather_feedback;

    if (badWeatherPlaces.length === 0) {
        const anyWeather = regionWeatherMap.values().next().value;
        weather_feedback = {
        summary: anyWeather.summary,
        gpt: anyWeather.gpt
    };
    } else {
        const summaryText = badWeatherPlaces.map(
            p => `- ${p.place_name} (${p.region}): ${p.weather}. ${p.feedback}`
        ).join('\n');
        weather_feedback = await gptRes(`다음 장소들의 날씨가 좋지 않습니다:\n${summaryText}...\n일정에 영향을 줄만한 요인을 요약해 주세요.`);
    }

    return { placeFeedbacks, weather_feedback };
}
// =============================날씨 ==============================




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

        //feedbacks: 전체 day별 피드백 결과
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
                const { placeFeedbacks, weather_feedback } = await getWeatherFeedback(day, trip.start_date);
                const distance_feedback = await getDistanceFeedback(day);
                const breaktime_feedback = await getBreaktimeFeedback(day);

                return {
                    day: day.day_order,
                    feedback: {
                        distance_feedback,
                        breaktime_feedback,
                        weather_feedback
                    },
                    places: placeFeedbacks
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