// KakaoMap.js

import React, { useEffect, useRef, useState } from "react";

const KakaoMap = ({ days }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef([]);
  const polylineRef = useRef([]);

  useEffect(() => {
    if (!days || days.length === 0) return;

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.kakao?.maps) {
          setMapLoaded(true);
          return resolve(window.kakao);
        }

        const script = document.createElement("script");
        const kakaomap_js_key = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaomap_js_key}&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            setMapLoaded(true);
            resolve(window.kakao);
          });
        };
        document.head.appendChild(script);
      });
    };

    loadScript().then((kakao) => {
      if (!kakao?.maps?.LatLng) return;

      const container = mapRef.current;
      const center = getFirstPlaceCoord(days) || new kakao.maps.LatLng(36.5, 127.8);
      const level = getFirstPlaceCoord(days) ? 7 : 12;
      const map = new kakao.maps.Map(container, { center, level });

      mapRef.current.__map__ = map;

      renderMarkers(map, days, kakao);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current?.__map__) return;

    const map = mapRef.current.__map__;
    const kakao = window.kakao;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    polylineRef.current.forEach(polyline => polyline.setMap(null));
    polylineRef.current = [];

    renderMarkers(map, days, kakao);
  }, [days]);

  const renderMarkers = (map, days, kakao) => {
    days.forEach((day) => {
      let color;
      if (day.color === "red") color = "#f39f9f";
      else if (day.color === "orange") color = "#f7c59f";
      else if (day.color === "purple") color = "#c3b1e1";
      
      let counter = 1;
      const linePath = [];

      const places = (day.items || []).filter(i => i.type === "place");

      places.forEach((place) => {
        const lat = place.latitude || place.place_latitude;
        const lng = place.longitude || place.place_longitude;
        if (!lat || !lng) return;

        const markerPosition = new kakao.maps.LatLng(lat, lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition,
          map,
          image: createNumberedMarkerImage(counter++, color, kakao),
        });

        map.setCenter(markerPosition);
        map.setLevel(4);

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px; font-size:12px;">${place.place_name || place.name}</div>`
        });

        kakao.maps.event.addListener(marker, "mouseover", () => infowindow.open(map, marker));
        kakao.maps.event.addListener(marker, "mouseout", () => infowindow.close());

        markersRef.current.push(marker);
        linePath.push(markerPosition);
      });

      if (linePath.length >= 2) {
        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 2,
          strokeColor: color,
          strokeOpacity: 0.6,
          strokeStyle: 'dash',
          map
        });
        polylineRef.current.push(polyline);
      }
    });
  };

  const getFirstPlaceCoord = (days) => {
    for (const day of days) {
      for (const item of day.items || []) {
        if (item.type === "place" && (item.latitude || item.place_latitude)) {
          return new window.kakao.maps.LatLng(item.latitude || item.place_latitude, item.longitude || item.place_longitude);
        }
      }
    }
    return null;
  };

  const createNumberedMarkerImage = (number, color, kakao) => {
    const svg = `
      <svg width="36" height="42" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="18" y="23" font-size="16" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">${number}</text>
      </svg>`;
    const svgUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    return new kakao.maps.MarkerImage(svgUrl, new kakao.maps.Size(36, 42), { offset: new kakao.maps.Point(18, 20) });
  };

  return (
    <div>
      {!mapLoaded && <p style={{ textAlign: "center" }}>지도를 불러오는 중입니다...</p>}
      <div ref={mapRef} style={{ width: "100%", height: "870px", borderRadius: "12px" }} />
    </div>
  );
};

export default KakaoMap;
