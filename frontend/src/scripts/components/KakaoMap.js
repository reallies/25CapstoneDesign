// KakaoMap.js

import React, { useEffect, useRef } from "react";

const KakaoMap = ({ days }) => {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef([]);

  useEffect(() => {

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.kakao?.maps) {
          return resolve(window.kakao);
        }

        const script = document.createElement("script");
        const kakaomap_js_key = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaomap_js_key}&autoload=false`;
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
        level: 7,
      };

      kakaoMapRef.current = new kakaoMaps.Map(container, options);
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
      let color = "#FF5F5F";
      if (day.color === "red") color = "#f39f9f";
      else if (day.color === "orange") color = "#f7c59f";
      else if (day.color === "purple") color = "#c3b1e1";

      let counter = 1;
      const path = [];

      const places = (day.items || []).filter((i) => i.type === "place");
      places.forEach((place) => {
        const lat = place.latitude || place.place_latitude;
        const lng = place.longitude || place.place_longitude;
        if (lat == null || lng == null) return;

        const position = new kakaoMaps.LatLng(lat, lng);
        // 각 day용 Path에 추가
        path.push(position);
        bounds.extend(position);

        // 번호가 표시된 마커 이미지 생성
        const marker = new kakaoMaps.Marker({
          position,
          map,
          image: createNumberedMarkerImage(counter++, color, kakaoMaps),
        });
        markersRef.current.push(marker);
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
  }, [days]);

  // 번호가 마커 이미지 생성 함수
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

  return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: "12px" }} />;
};

export default KakaoMap;
