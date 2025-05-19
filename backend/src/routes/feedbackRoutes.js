const express = require("express");
const prisma = require("../../prisma/prismaClient");
const router = express.Router();
const OpenAI = require("openai");
const axios = require("axios");
const fs = require("fs");

const weatherCache = new Map();
const path = require("path");
const csvParser = require("csv-parser");
const iconv = require("iconv-lite");

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

//가까운 관측소 id, 지역 이름 찾기
async function extractStationsId(avgLat,avgLon){
    const FilePath = path.join(__dirname, "../../public/stationsId.csv");
    
    return new Promise((resolve,reject)=>{
        const stations = [];

        fs.createReadStream(FilePath)
            .pipe(iconv.decodeStream("euc-kr"))
            .pipe(csvParser())
            .on("data", (row) => {
                const lat = parseFloat(row.latitude);
                const lon = parseFloat(row.longitude);

                //가장 가까운 관측소 찾기
                if (!isNaN(lat) && !isNaN(lon)) {
                    const simpleDist = Math.abs(lat - avgLat) + Math.abs(lon - avgLon);
                    stations.push({ 
                        stnId: row.stnId, 
                        name: row.name, 
                        simpleDist 
                    });
                }
            })
            .on("end", () => {
                stations.sort((a, b) => a.simpleDist - b.simpleDist);
                resolve({stnId: stations[0].stnId, regionName:stations[0].name }); // 가장 가까운 관측소
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

//특정 관측소 날씨 요약 + gpt 피드백
async function getWeatherFromKMA(visitDate, lat, lon) {
    const baseDate = new Date(visitDate);
    baseDate.setDate(baseDate.getDate() - 365); // 작년 같은 날 기준
    const tm = changeDateYYYYMMDD(baseDate);
    
    const { stnId, regionName } = await extractStationsId(lat, lon);
    
    const saveFilePath = path.join(dir, `weather_past_${stnId}_${visitDate.toISOString().split("T")[0]}.csv`);
    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?tm=${tm}&stn=${stnId}&help=1&authKey=${process.env.WEATHER_API_KEY2}`;

    try {
        const res = await axios.get(url, { responseType: 'arraybuffer'});
        const decoded = iconv.decode(res.data, 'euc-kr');
        fs.writeFileSync(saveFilePath, decoded);

        const lines = decoded.split('\n');
        const dataLine = lines.find((line) => /^\d{8},/.test(line));
        if (!dataLine) return { summary: "날씨 데이터 탐색 실패", gpt: "" };

        const fields = dataLine.split(',');
        const safe = (val) => (val === undefined || val === null || val === '' || val === '-9.0' || val === '-9') ? null : val;

        const parsed = {
            maxTemp: safe(fields[11]),
            minTemp: safe(fields[13]),
            humidity: safe(fields[17]),
        };

       const summary = {
            main: "작년 날씨",
            maxTemp: `${parsed.maxTemp}℃`,
            minTemp: `${parsed.minTemp}℃`,
            humidity: `${parsed.humidity}%`,
        };

        return { summary, regionName };
    } catch (error) {
        console.error("기상청 과거 날씨 API 오류:", error.message);
        return { summary: "기상청 과거 날씨 조회 실패", gpt: "" };
    }
}

//day별 일정 안의 모든 장소 날씨 + 지역날씨 피드백 리스트
async function getWeatherFeedbackFromKMA(day, visitDate) {
    const stationMap = new Map();
    for (const p of day.places) {
        const { place_name, place_latitude: lat, place_longitude: lon } = p.place;
        const { stnId, regionName } = await extractStationsId(lat, lon);

        if (!stationMap.has(stnId)) {
            stationMap.set(stnId, {
                regionName,
                lat,
                lon,
                places: [place_name],
            });
        }else {
            stationMap.get(stnId).places.push(place_name);
        }
    }

    const weather_info = [];
    const summaryList = [];

    for (const [stnId, info] of stationMap.entries()) {
        const weather = await getWeatherFromKMA(visitDate, info.lat, info.lon);
        weather_info.push({
            region: info.regionName,
            places: info.places,
            summary: weather.summary
        });

        summaryList.push(
            `- ${info.places.join(", ")} (${info.regionName}): ${weather.summary.main}, 최고 ${weather.summary.maxTemp}, 최저 ${weather.summary.minTemp}, 습도 ${weather.summary.humidity}`
        );
    }

     const prompt = `
        아래는 여행 일정에 포함된 장소별 과거 날씨 정보입니다:

        ${summaryList.join("\n")}

        이 장소들의 날씨를 종합적으로 고려해서 여행 팁을 2~3문장으로 요약해줘.
        장소명을 자연스럽게 포함해서 알려줘.`;

    const weather_feedback  = await gptRes(prompt);

    return { weather_info, weather_feedback  };
}

//이모지
function convertWeatherDescription(original) {
  const map = {
    "실 비": "약한 비 🌦️",
    "강한 비": "폭우 🌧️",
    "온흐림": "부분적으로 흐림 ⛅",
    "튼구름": "대체로 흐림 🌥️",
    "맑음": "맑음 ☀️",
    "비": "비 🌧️",
    "눈": "눈 ❄️",
    "박무": "안개 🌫️",
  };
  return map[original] || original;
}

//place_address에서 시/군/구만 추출
function extractRegion(address) {
    if (!address) return "알 수 없음";
    
    const match = address.match(/(\S+)\s(\S+(구|시|군))/); 
    return match ? `${match[1]} ${match[2]}` : "알 수 없음";
}

//오픈 날씨 api
async function getWeatherFromOpen(region, visitDate, avgLat, avgLon) {
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

        const rawDescription = daily.weather[0].description;
        const friendlyDescription = convertWeatherDescription(rawDescription);

        return {
            summary: {
                main: friendlyDescription,
                maxTemp: `${daily.temp.max}℃`,
                minTemp: `${daily.temp.min}℃`
            }
        };

    } catch (error) {
        console.error("OpenWeather 날씨 API 오류:", error.message);
        return { summary: "날씨 정보 가져오기 실패", gpt: "" };
    }
}

//지역으로 묶은 뒤 지역 날씨 불러오기
async function getWeatherFeedbackFromOpen(day, visitDate) {
    const regionMap = new Map();

    for (const p of day.places) {
        const {place_name, place_latitude: lat, place_longitude: lon, place_address: address } = p.place;

        // 주소에서 시/군/구 추출
        const match = address?.match(/(\S+\s)?(\S+(구|시|군))/);
        const region = match ? match[0] : "알 수 없음";

        if (!regionMap.has(region)) {
            regionMap.set(region, []);
        }
        regionMap.get(region).push({ place_name, lat, lon });
    }

    const weather_info = [];
    const summaryList = [];

    for (const [region, placeGroup] of regionMap.entries()) {
    const avgLat = placeGroup.reduce((s, p) => s + p.lat, 0) / placeGroup.length;
    const avgLon = placeGroup.reduce((s, p) => s + p.lon, 0) / placeGroup.length;
    const weather = await getWeatherFromOpen(region, visitDate, avgLat, avgLon);

    weather_info.push({
      region,
      places: placeGroup.map(p => p.place_name),
      summary: weather.summary
    });

    summaryList.push(
      `- ${placeGroup.map(p => p.place_name).join(", ")} (${region}): ${weather.summary.main}, 최고 ${weather.summary.maxTemp}, 최저 ${weather.summary.minTemp}`
    );
  }

  const prompt = `
    아래는 여행 일정에 포함된 장소별 날씨 정보입니다:

    ${summaryList.join("\n")}

    이 장소들의 날씨를 종합적으로 고려해서 여행 팁을 2~3문장으로 요약해줘.
    장소명을 자연스럽게 포함해서 알려줘.`;

    const weather_feedback  = await gptRes(prompt);

    return { weather_info, weather_feedback  };
}

async function getWeatherFeedback(day, tripStartDate) {
    const visitDate = new Date(tripStartDate.getTime() + (day.day_order - 1) * 86400000);
    const daysDiff = Math.ceil((visitDate - new Date()) / (1000 * 60 * 60 * 24));

    return daysDiff >= 8
        ? await getWeatherFeedbackFromKMA(day, visitDate)
        : await getWeatherFeedbackFromOpen(day, visitDate);
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
                const {weather_info, weather_feedback} = await getWeatherFeedback(day, trip.start_date);
                const distance_feedback = await getDistanceFeedback(day);
                const breaktime_feedback = await getBreaktimeFeedback(day);

                return {
                    day: day.day_order,
                    feedback: {
                        distance_feedback,
                        breaktime_feedback,
                        weather_info,
                        weather_feedback,
                    },
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