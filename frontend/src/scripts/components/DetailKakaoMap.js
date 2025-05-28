// src/components/DetailkakaoMap.js
import React, { useEffect, useRef, useState } from "react";

export default function DetailKakaoMap({ days = [] }) {
    const mapRef = useRef(null);
    const kakaoMapRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef([]);
    const [loaded, setIsMapLoaded] = useState(false);

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

            setIsMapLoaded(true);
        });
    }, []);

    // 2) days나 mapLoaded가 바뀔 때마다 마커/경로 재렌더링
    useEffect(() => {
        if (!loaded || !days) return;

        const kakao = window.kakao.maps;
        const map = kakaoMapRef.current;

        if (!map) return;


        // 이전 마커/폴리라인 제거
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        polylineRef.current.forEach((pl) => pl.setMap(null));
        polylineRef.current = [];

        // 새로 그릴 경계 객체
        const bounds = new kakao.LatLngBounds();

        const colorArr = ["#f39f9f", "#f7c59f", "#c3b1e1"];

        days.forEach((day) => {
            const idx = (day.day_order - 1) % colorArr.length;
            const color = colorArr[idx]; let counter = 1;
            const path = [];

            (day.places || []).forEach(dayPlace => {
                const lat = dayPlace.place.place_latitude;
                const lng = dayPlace.place.place_longitude;

                if (lat == null || lng == null) return;
                const position = new kakao.LatLng(lat, lng);
                bounds.extend(position);
                path.push(position);

                // 마커
                const marker = new kakao.Marker({
                    map, position,
                    image: createNumberedMarkerImage(counter++, color, kakao)
                });
                markersRef.current.push(marker);

                // 툴팁
                const info = new kakao.InfoWindow({
                    content: `<div class="map-tooltip">${dayPlace.place.place_name}</div>`
                });
                kakao.event.addListener(marker, "mouseover", () => info.open(map, marker));
                kakao.event.addListener(marker, "mouseout", () => info.close());
            });

            // 경로 그리기 (장소가 2개 이상일 때만)
            if (path.length >= 2) {
                const line = new kakao.Polyline({ path, strokeWeight: 4, strokeColor: color, strokeOpacity: 0.7, map });
                polylineRef.current.push(line);
            }
        });


        if (!bounds.isEmpty()) {
            map.setBounds(bounds);
        }
    }, [days, loaded]);

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

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                overflow: "hidden",
            }}
        />
    );
}
