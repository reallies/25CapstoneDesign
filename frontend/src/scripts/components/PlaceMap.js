import React, { useEffect, useRef } from 'react';

const PlaceMap = ({ selectedPlace }) => {
  const mapRef = useRef(null);
  const scriptId = 'kakao-maps-sdk';

  useEffect(() => {
    if (!selectedPlace) return;

    // 1) SDK 로드 함수
    const loadKakaoSDK = () => {
      return new Promise((resolve) => {
        // 이미 로드된 경우 바로 resolve
        if (window.kakao?.maps) {
          return resolve(window.kakao.maps);
        }
        // 중복 로드 방지
        if (document.getElementById(scriptId)) {
          // 스크립트는 있지만 maps 초기화 전인 경우
          window.kakao?.maps.load(() => resolve(window.kakao.maps));
          return;
        }

        // 새로 스크립트 태그 만들기
        const script = document.createElement('script');
        script.id = scriptId;
        const key = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services,clusterer&autoload=false`;
        script.onload = () => {
          // SDK가 로드되면 maps.load 로 내부 초기화
          window.kakao.maps.load(() => {
            resolve(window.kakao.maps);
          });
        };
        document.head.appendChild(script);
      });
    };

    // 2) SDK 로드 후 지도 생성
    loadKakaoSDK().then((kakaoMaps) => {
      const container = mapRef.current;
      const options = {
        center: new kakaoMaps.LatLng(selectedPlace.y, selectedPlace.x),
        level: 4,
      };
      const map = new kakaoMaps.Map(container, options);

      // 마커
      const markerPos = new kakaoMaps.LatLng(selectedPlace.y, selectedPlace.x);
      new kakaoMaps.Marker({ map, position: markerPos });

      // 인포윈도우
      const infowindow = new kakaoMaps.InfoWindow({
        content: `<div style="padding:5px;">${selectedPlace.place_name}</div>`,
      });
      infowindow.open(map, markerPos);

      // cleanup: 컴포넌트 언마운트 시 맵 제거
      return () => {
        infowindow.close();
        map.setMap(null);
      };
    });

    // (선택 사항) 언마운트 시 스크립트 제거하고 싶다면 아래 uncomment
    // return () => {
    //   const existing = document.getElementById(scriptId);
    //   if (existing) existing.remove();
    // };

  }, [selectedPlace]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '20px',
        marginBottom: '10px'
      }}
    />
  );
};

export default PlaceMap;
