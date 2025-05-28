// kakaoConfig.js

// 테마에 따른 카테고리 그룹 코드 매핑
const themeCategoryMap = {
    ADVENTURE: ["CT1"],
    // SNS_HOTSPOT: ["CE7", "AD5"],
    LANDMARK: ["AT4"],
    CULTURE_HISTORY: ["AT4"],
    // FESTIVAL_EVENT: ["AT4", "AD5"],
    NATURE: ["AT4"],
    SHOPPING: ["MT1"],
    // HEALING: ["CE7", "AT4"],
    FOOD_TOUR: ["FD6"]
  };
  
  // 지역 중심 좌표
  const regionCenterCoords = {
    "서울": { lat: 37.5665, lng: 126.9780 },
    "부산": { lat: 35.1796, lng: 129.0756 },
    "대구": { lat: 35.8714, lng: 128.6014 },
    "광주": { lat: 35.1595, lng: 126.8526 },
    "대전": { lat: 36.3504, lng: 127.3845 },
    "인천": { lat: 37.4563, lng: 126.7052 },
    "경기": { lat: 37.4138, lng: 127.5183 },
    "강원": { lat: 37.8228, lng: 128.1555 },
    "충북": { lat: 36.6357, lng: 127.4917 },
    "충남": { lat: 36.5184, lng: 126.8000 },
    "전북": { lat: 35.7167, lng: 127.1442 },
    "전남": { lat: 34.8161, lng: 126.4630 },
    "경북": { lat: 36.5759, lng: 128.5056 },
    "경남": { lat: 35.4606, lng: 128.2132 },
    "제주": { lat: 33.4996, lng: 126.5312 }
  };
  
  module.exports = { themeCategoryMap, regionCenterCoords };