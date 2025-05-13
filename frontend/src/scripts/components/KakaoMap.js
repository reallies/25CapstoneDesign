// KakaoMap.js

import  { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";
import AlertModal from "../components/AlertModal";


const KakaoMap = ({ days }) => {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef([]);

  const roadviewClientRef = useRef(null);
  const roadviewRef = useRef(null);
  const roadviewContainerRef = useRef(null);

  const [isRoadviewMode, setIsRoadviewMode] = useState(false);
  const [isRoadviewVisible, setIsRoadviewVisible] = useState(false);// 로드뷰 화면 오버레이
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");



  useEffect(() => {

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.kakao?.maps) {
          return resolve(window.kakao.maps);
        }

        const script = document.createElement("script");
        const kakaomap_js_key = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
        script.src =
          `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaomap_js_key}&libraries=services,clusterer&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve(window.kakao.maps);
          });
        };
        document.head.appendChild(script);
      });
    };

    loadScript().then((kakaoMaps) => {
      const container = mapRef.current;
      const options = {
        center: new kakaoMaps.LatLng(36.5, 127.8),
        level: 12,
      };

      kakaoMapRef.current = new kakaoMaps.Map(container, options);
      console.log("🎬 Roadview 초기화 직전:", kakaoMaps.Roadview);
      roadviewRef.current = new kakaoMaps.Roadview(
        roadviewContainerRef.current,
        { visible: false }
      );
      roadviewClientRef.current = new kakaoMaps.RoadviewClient();

    });
  }, []);

  useEffect(() => {
    const kakaoMaps = window.kakao?.maps;
    const map = kakaoMapRef.current;
    if (!kakaoMaps || !map || !days) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    // 기존 폴리라인 제거
    polylineRef.current.forEach((line) => line.setMap(null));
    polylineRef.current = [];

    // 좌표 및 Bounds 생성
    const bounds = new kakaoMaps.LatLngBounds();

    days.forEach((day) => {
      // day.color에 따라 선/마커 색상 결정
      let color = { red: "#f39f9f", orange: "#f7c59f", purple: "#c3b1e1" }[day.color] || "#FF5F5F";

      let counter = 1;
      const path = [];

      (day.items || []).filter((i) => i.type === "place")
        .forEach((place) => {
          const lat = place.latitude || place.place_latitude;
          const lng = place.longitude || place.place_longitude;
          if (lat == null || lng == null) return;
          const position = new kakaoMaps.LatLng(lat, lng);
          bounds.extend(position);
          path.push(position);

          // 번호가 표시된 마커 이미지 생성
          const marker = new kakaoMaps.Marker({
            position,
            map,
            image: createNumberedMarkerImage(counter++, color, kakaoMaps),
          });
          markersRef.current.push(marker);


          // 로드뷰 모드일 때만 클릭 이벤트 등록
          if (isRoadviewMode) {
            kakaoMaps.event.addListener(marker, "click", () => {

              // 오버레이 띄우기
              setIsRoadviewVisible(true);

              // panoId로 로드뷰 세팅 
              roadviewClientRef.current.getNearestPanoId(
                position,
                200,
                (panoId) => {
                  if (panoId) {
                    console.log("로드뷰 panoId:", panoId);
                    roadviewRef.current.setPanoId(panoId, position);
                  }
                  else {
                    setAlertText("장소 근방에 조회 가능한 로드뷰가 없습니다.");
                    setAlertOpen(true);
                    setIsRoadviewVisible(false);
                    return;
                  }
                }
              );
            });
          }
        });

      // day별 폴리라인 생성
      if (path.length >= 2) {
        const polyline = new kakaoMaps.Polyline({
          path,
          strokeWeight: 4,
          strokeColor: color,
          strokeOpacity: 0.7,
          map,
        });
        polylineRef.current.push(polyline);
      }
    });

    // 지도 뷰포트 조정: 모든 마커 포함
    if (!bounds.isEmpty()) {
      map.setBounds(bounds);
    }
  }, [days, isRoadviewMode]);

  // 번호 마커 이미지 생성 함수
  const createNumberedMarkerImage = (number, color, kakaoMaps) => {
    const svg = `
      <svg width="36" height="42" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="18" y="23" font-size="16" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">${number}</text>
      </svg>`;
    const svgUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    return new kakaoMaps.MarkerImage(
      svgUrl,
      new kakaoMaps.Size(36, 42),
      { offset: new kakaoMaps.Point(18, 20) }
    );
  };

  const toggleRoadview = () => {
    setIsRoadviewMode(prev => {
      const next = !prev;

      // 로드뷰 모드를 끌 때만 화면에서 숨기고 선택 해제
      if (!next) {
        setIsRoadviewVisible(false);
      }

      return next;
    });
  };

  return (
    <div className="map-wrapper">

      <div ref={mapRef} className="map-view" />

      <button
        className={`roadview-toggle-btn${isRoadviewMode ? " active" : ""}`}
        onClick={toggleRoadview}
      >
        {isRoadviewMode ? "로드뷰 모드 해제" : "로드뷰 보기"}
      </button>

      <div ref={roadviewContainerRef}
        className="roadview-container"
        style={{ display: isRoadviewVisible ? "flex" : "none" }}
      />
      {/* 경고 모달 */}
      {alertOpen && (
        <AlertModal text={alertText} onClose={() => setAlertOpen(false)} />
      )}
    </div>
  )
}

export default KakaoMap;
