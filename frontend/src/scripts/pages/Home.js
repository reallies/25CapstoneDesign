import React from "react";
import "./Home.css";

const Main = () => {
  return (
    <div className="main-container">
    {/* 검색 바 */}
    <div className="search-box">
      <div className="button-container">
        <button className="rounded-button">AI 일정</button>
        <button className="text-button">직접 짜기</button>
      </div>
      <div className="search-content">
        <div className="search-field">여행지</div>
        <div className="search-field">여행 시작/여행 완료</div>
        <div className="search-field">여행 테마</div>
        <div className="search-field">동행 인원</div>
        <div className="schedule-button">일정 만들기</div>
      </div>
    </div>

      {/* 인기 여행지 */}
      <div className="popular-destinations">
        <div className="popular-title">
          인기 여행지
        </div>
        <div className="destination-list">
          <div className="destination-card">
            <img className="destination-image" src="https://placehold.co/116x145" alt="서울" />
            <div className="destination-info">서울</div>
            <div className="destination-subtext">서울특별시</div>
          </div>
          <div className="destination-card">
            <img className="destination-image" src="https://placehold.co/116x145" alt="제주도" />
            <div className="destination-info">제주도</div>
            <div className="destination-subtext">제주특별자치도</div>
          </div>
          <div className="destination-card">
            <img className="destination-image" src="https://placehold.co/116x145" alt="부산" />
            <div className="destination-info">부산</div>
            <div className="destination-subtext">부산광역시</div>
          </div>
          <div className="destination-card">
            <img className="destination-image" src="https://placehold.co/116x145" alt="인천" />
            <div className="destination-info">인천</div>
            <div className="destination-subtext">인천광역시</div>
          </div>
          <div className="destination-card">
            <img className="destination-image" src="https://placehold.co/116x145" alt="경주" />
            <div className="destination-info">경주</div>
            <div className="destination-subtext">경상북도 경주시</div>
          </div>
        </div>
      </div>

      <div className="gallery-records-container">
        {/* 여행 갤러리 */}
        <div className="travel-gallery">
          <div className="gallery-title">여행 갤러리</div>
          <div className="gallery-container">
            <div className="gallery-card"></div>
            <div className="gallery-card"></div>
            <div className="gallery-card"></div>
            <div className="gallery-card"></div>
          </div>
        </div>

        {/* 내 기록 */}
        <div className="my-records">
          <div className="records-title">내 기록</div>
          <div className="records-container">
            <div className="record-card"></div>
            <div className="record-card"></div>
            <div className="record-card"></div>
            <div className="record-card"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;