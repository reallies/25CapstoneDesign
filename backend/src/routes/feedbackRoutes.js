const express = require("express");
const prisma = require("../../prisma/prismaClient");
const router = express.Router();
const OpenAI = require("openai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const iconv = require("iconv-lite");

const weatherCache = new Map();

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ### 공통 함수 ###

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

// ================== 거리 피드백 함수 ==================

//거리피드백
// feedbackRoutes.js
async function getDistanceFeedback(day) {
    const placeNames = day.places.map(p => p.place.place_name);
    const placeNameToDayPlaceId = {};
    day.places.forEach(p => {
        placeNameToDayPlaceId[p.place.place_name] = p.dayplace_id;
    });
    const regions = day.places.map(p => extractRegion(p.place.place_address));
    const coordinates = day.places.map(p => `(${p.place.place_latitude}, ${p.place.place_longitude})`);

    console.log(`DAY ${day.day_order} 입력 장소: ${placeNames.join(", ")}`);
    console.log(`DAY ${day.day_order} 좌표: ${coordinates.join(", ")}`);

    const prompt = `DAY ${day.day_order} 장소: ${placeNames.join(", ")}. 지역: ${regions.join(", ")}. 좌표: ${coordinates.join(", ")}. 제공된 장소만 사용해 동선 비효율 시 순서를 제안하세요. 다른 장소를 추가하지 마세요. 100자 이내. 다음 형식으로 출력:\n📍 추천 순서: [${placeNames.join(", ")}]\n\n👉 간단한 요약 (예: 이 순서로 이동하면 효율적입니다).`;

    const response = await gptRes(prompt);
    console.log(`DAY ${day.day_order} GPT 응답: ${response}`);

    let recommendedNames = [];
    const match = response.match(/\[(.+?)\]/);
    if (match) {
        const placeString = match[1];
        recommendedNames = placeString
            .split(',')
            .map(name => name.trim().replace(/['"]/g, ''));
        recommendedNames = recommendedNames.filter(name => {
            const isValid = placeNames.some(p => p.includes(name) || name.includes(p));
            if (!isValid) {
                console.warn(`유효하지 않은 장소 이름: ${name}`);
            }
            return isValid;
        });
    } else {
        console.warn(`DAY ${day.day_order} 응답 형식이 맞지 않습니다. 기본 순서를 사용합니다.`);
        recommendedNames = placeNames;
    }

    recommendedNames = [...new Set(recommendedNames)];

    const recommendedOrder = recommendedNames
        .map(name => {
            const matchedPlace = placeNames.find(p => p.includes(name) || name.includes(p));
            return matchedPlace ? placeNameToDayPlaceId[matchedPlace] : null;
        })
        .filter(id => id !== undefined);

    console.log(`DAY ${day.day_order} 추출된 장소 이름: ${recommendedNames}`);
    return { feedback: response, recommendedOrder };
}

// ================== 운영시간 피드백 함수 ==================

// Kakao Map API에서 가져온 장소 이름으로 Google Maps에서 place_id 찾기
async function findPlaceId(placeName, lat, lng, address) {
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
    let query = placeName;
    if (address) {
        query = `${placeName} ${address}`; // 이름과 주소를 결합해 검색
    }
    
    const searchBody = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 2000.0,
      },
    },
  };

  try {
    const response = await axios.post(searchUrl, searchBody, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
    });
    if (response.data.places && response.data.places.length > 0) {
      return response.data.places[0].id;
    } else {
      console.warn(`장소 검색 결과 없음: ${placeName}`);
      return null;
    }
  } catch (error) {
    console.error("Place Search 오류:", error.message);
    return null;
  }
}

// Google Maps API에서 운영시간 가져오기
async function getOperatingHours(placeId) {
  const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const response = await axios.get(detailsUrl, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "regularOpeningHours",
      },
    });
    const openingHours = response.data.regularOpeningHours;
    return openingHours ? openingHours.periods : null;
  } catch (error) {
    console.error("운영시간 조회 오류:", error.message);
    return null;
  }
}

// 운영시간 파싱
function parseOperatingHours(periods) {
  if (!periods) return null;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const result = {};

  periods.forEach((period) => {
    const day = days[period.open.day];
    const openTime = `${period.open.hour.toString().padStart(2, "0")}:${period.open.minute
      .toString()
      .padStart(2, "0")}`;
    const closeTime = period.close
      ? `${period.close.hour.toString().padStart(2, "0")}:${period.close.minute.toString().padStart(2, "0")}`
      : "24:00";
    if (!result[day]) result[day] = [];
    result[day].push(`${openTime}-${closeTime}`);
  });

  return result;
}

// 모든 장소의 운영시간을 병렬로 가져오기
async function getAllOperatingHours(places) {
  const batchSize = 5; // 한 번에 처리할 장소 수
  const batches = [];
  for (let i = 0; i < places.length; i += batchSize) {
    batches.push(places.slice(i, i + batchSize));
  }

  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(async (place) => {
        const placeId = await findPlaceId(place.place_name, place.place_latitude, place.place_longitude, place.place_address);
        if (placeId) {
          const hours = await getOperatingHours(placeId);
          return parseOperatingHours(hours);
        }
        return null;
      })
    );
    results.push(...batchResults);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
  }
  return results;
}

// 방문 요일 계산
function getVisitDay(startDate, dayOrder) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (dayOrder - 1));
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
}

function parsePlannedTime(plannedTime) {
    if (!plannedTime) return null;
    const match = plannedTime.match(/(오전|오후)\s(\d{1,2}):(\d{2})/);
    if (!match) {
        console.warn(`Invalid plannedTime format: ${plannedTime}`);
        return null;
    }
    const [, period, hourStr, minStr] = match;
    let hour = parseInt(hourStr);
    const min = parseInt(minStr);
    if (period === "오전") {
        if (hour === 12) {
            hour = 0; // 오전 12시는 00시
        }
    } else if (period === "오후") {
        if (hour !== 12) {
            hour += 12; // 오후 1시~11시는 +12, 오후 12시는 12시 유지
        }
    }
    return { hour, min };
}

// 운영시간과 방문 예정 시간 비교 함수
function isWithinOperatingHours(operatingHours, plannedTime, visitDay) {
    if (!operatingHours || !operatingHours[visitDay] || !plannedTime) {
        return { within: false, message: "운영시간 정보가 없거나 방문 예정 시간이 없습니다." };
    }

    const parsedTime = parsePlannedTime(plannedTime);
    if (!parsedTime) {
        return { within: false, message: "방문 예정 시간 형식이 올바르지 않습니다." };
    }
    const { hour: plannedHour, min: plannedMin } = parsedTime;
    const plannedTimeMin = plannedHour * 60 + plannedMin;

    for (const period of operatingHours[visitDay]) {
        const [open, close] = period.split("-");
        const [openHour, openMin] = open.split(":").map(Number);
        const [closeHour, closeMin] = close.split(":").map(Number);

        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;

        if (plannedTimeMin >= openTime && plannedTimeMin <= closeTime) {
            return { within: true };
        }
    }

    return { within: false, message: `방문 예정 시간이 운영시간을 벗어납니다. 운영시간은 ${operatingHours[visitDay].join(", ")}입니다!` };
}

// 수정된 운영시간 피드백 함수
async function getOperatingHoursFeedback(day, places, plannedTimes, tripStartDate) {
    const operatingHours = await getAllOperatingHours(places);
    if (!operatingHours || operatingHours.every(h => !h)) {
        return "운영시간 정보를 확인할 수 없습니다.";
    }

    const visitDay = getVisitDay(tripStartDate, day.day_order);
    const placeDetails = places.map((place, index) => {
        const hours = operatingHours[index] && operatingHours[index][visitDay]
            ? operatingHours[index][visitDay].join(", ")
            : "정보 없음";
        const plannedTime = plannedTimes[index] || "미정";
        let warning = "";

        // 운영시간과 방문 예정 시간을 비교
        if (plannedTimes[index] && operatingHours[index]) {
            const check = isWithinOperatingHours(operatingHours[index], plannedTimes[index], visitDay);
            if (!check.within) {
                warning = ` ⚠️ ${check.message}`; // 경고 메시지를 명시적으로 추가
            }
        }

        return `- 📍 ${place.place_name}: 🕙 ${hours}${warning}`;
    }).join("\n");

    const prompt = `DAY ${day.day_order} (${visitDay})의 장소 운영시간 및 방문 예정 시간:\n${placeDetails}\n\n친근하고 간결한 대화체로 피드백을 제공하세요. 항상 존대말을 사용하세요. 다음 형식으로 출력:\n${places.map(p => `📍 ${p.place_name}: 🕙 운영시간\n`).join("")}\n👉 방문 시간을 미리 확인해 원활한 일정을 준비하세요!\n\n각 장소의 운영시간을 '🕙 HH:MM-HH:MM' 형식으로 나열하고, 방문 예정 시간이 운영시간을 벗어나면 해당 장소 옆에 경고 메시지(⚠️)와 함께 구체적인 이유를 반드시 포함하세요. 150자 이내로 작성하세요.`;

    const feedback = await gptRes(prompt);
    return feedback || "운영시간 피드백 생성에 실패했습니다.";
}


// ================== 날씨 관련 함수 ==================

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
  console.log(`DAY ${day.day_order} - daysDiff: ${daysDiff}, visitDate: ${visitDate}`);

  try {
    if (visitDate < new Date()) {
      console.log("과거 날짜 감지, KMA 호출");
      return await getWeatherFeedbackFromKMA(day, visitDate);
    } else if (daysDiff >= 8) {
      console.log("8일 이상 미래, KMA 호출");
      return await getWeatherFeedbackFromKMA(day, visitDate);
    } else {
      console.log("8일 미만 미래, OpenWeather 호출");
      return await getWeatherFeedbackFromOpen(day, visitDate);
    }
  } catch (error) {
    console.error("날씨 피드백 오류:", error.message);
    return { weather_info: [], weather_feedback: "날씨 정보를 가져오지 못했습니다." };
  }
}



// ### 라우터 ###
router.get("/:trip_id", async (req, res) => {
    const { trip_id } = req.params;
    try {
        const trip = await prisma.trip.findUnique({
            where: { trip_id },
            include: {
                days: {
                    include: {
                        places: {
                            include: { place: true },
                            orderBy: { dayplace_order: "asc" }
                        }
                    },
                    orderBy: { day_order: "asc" }
                }
            }
        });

        const feedbacks = await Promise.all(
            trip.days.map(async (day) => {
                if (day.places.length <= 1) {
                    return {
                        day: day.day_order,
                        day_id: day.day_id,
                        feedback: day.places.length === 0
                            ? `DAY ${day.day_order}에는 아직 방문할 장소가 없습니다. 장소를 추가해보세요!`
                            : `DAY ${day.day_order}에는 '${day.places[0].place.place_name}' 하나만 포함되어 있어 피드백은 어렵습니다. 주변 관광지를 함께 구성해보세요!`
                    };
                }

                const places = day.places.map((p) => p.place);
                const plannedTimes = day.places.map((p) => p.dayplace_time || null);
                const { weather_info, weather_feedback } = await getWeatherFeedback(day, trip.start_date);
                const distance_feedback = await getDistanceFeedback(day);
                const operating_hours_feedback = await getOperatingHoursFeedback(day, places, plannedTimes, trip.start_date);

                return {
                    day: day.day_order,
                    day_id: day.day_id,
                    feedback: {
                        distance_feedback: distance_feedback.feedback,
                        recommended_order: distance_feedback.recommendedOrder,
                        weather_info,
                        weather_feedback,
                        operating_hours_feedback,
                    },
                };
            })
        );

        res.json({ feedbacks });
    } catch (error) {
        console.log(error, "feedback routes 에러");
        res.status(500).json({ error: "feedback routes 중 오류" });
    }
});

module.exports = router;