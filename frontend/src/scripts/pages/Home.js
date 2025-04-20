import React, { useState, useRef } from "react";
import "./Home.css";
import ChatBot from "../components/ChatBot";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import moreIcon from "../../assets/images/more.svg";
import plusIcon from "../../assets/images/plus.svg";
import { useNavigate } from "react-router-dom";


const Main = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [calendarDate, setCalendarDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("ai");

  const searchFieldRefs = useRef({});
  const navigate = useNavigate();

  const themeMap = {
    "모험·액티비티": "ADVENTURE",
    "SNS 핫플": "SNS_HOTSPOT",
    "랜드마크": "LANDMARK",
    "문화·역사": "CULTURE_HISTORY",
    "이벤트·축제": "FESTIVAL_EVENT",
    "감성·자연": "NATURE",
    "쇼핑": "SHOPPING",
    "여유·힐링": "HEALING",
    "맛집": "FOOD_TOUR",
  };

  const companionMap = {
    "혼자": "SOLO",
    "연인": "COUPLE",
    "친구": "FRIENDS",
    "배우자": "SPOUSE",
    "부모님": "FAMILY",
    "형제·자매": "SIBLINGS",
    "회사·동료": "COLLEAGUES",
    "반려동물": "PET",
    "동호회·취미": "HOBBY_GROUP",
    "기타": "OTHER",
  };

  // AI / 직접 일정 핸들러
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  // 모달 위치
  const [destinationModalPosition, setDestinationModalPosition] = useState({ top: 250, left: 100 });
  const [dateModalPosition, setDateModalPosition] = useState({ top: 300, left: 200 });
  const [themeModalPosition, setThemeModalPosition] = useState({ top: 350, left: 300 });
  const [peopleModalPosition, setPeopleModalPosition] = useState({ top: 400, left: 400 });

  // 여행지 선택 핸들러 - 최대 3개까지 선택
  const handleSelectDestination = (region) => {
    setSelectedDestination((prev) => {
      if (prev.includes(region)) {
        return prev.filter((r) => r !== region);
      } else if (prev.length < 3) {
        return [...prev, region];
      } else {
        alert("최대 3개의 여행지만 선택할 수 있습니다.");
        return prev;
      }
    });
  };

  // 여행 테마 토글 핸들러
  const toggleTheme = (theme) => {
    setSelectedTheme((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // 동행 유형 토글 핸들러
  const toggleCompanion = (companion) => {
    setSelectedPeople((prev) => {
      return prev.includes(companion)
        ? prev.filter((item) => item !== companion)
        : [...prev, companion];
    });
  };

  // 날짜 변경 핸들러
  const handleDateChange = (date) => {
    setCalendarDate(date);
  };

  // 날짜 두 자리 숫자
  const formatCalendarDay = (locale, date) => {
    const day = date.getDate();
    return day < 10 ? `0${day}` : `${day}`;
  };

  // 날짜 선택 확인
  const confirmDateSelection = () => {
    if (Array.isArray(calendarDate) && calendarDate.length === 2) {
      const [start, end] = calendarDate;
      const diffInMs = Math.abs(end - start);
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1;
  
      if (diffInDays > 7) {
        alert("최대 7일까지 선택할 수 있습니다.");
        return;
      }

      const formattedStartDate = calendarDate[0].toLocaleDateString("ko-KR");
      const formattedEndDate = calendarDate[1].toLocaleDateString("ko-KR");
      setSelectedDate(`${formattedStartDate} - ${formattedEndDate}`);
    } else if (calendarDate instanceof Date) {
      setSelectedDate(calendarDate.toLocaleDateString("ko-KR"));
    }
    closeModal();
  };

  // 모달
  const openModal = (modalType, event) => {
    let rect;
    if ((modalType === "destinationSearch" || modalType === "destination") && searchFieldRefs.current["destination"]) {
      rect = searchFieldRefs.current["destination"].getBoundingClientRect();  // 무조건 search-field 기준으로
    } else if (event) {
      rect = event.target.getBoundingClientRect();
    }
  
    if (rect) {
      let leftPos = Math.floor(rect.left + window.scrollX + rect.width / 2 - 175);
      leftPos = Math.max(10, Math.min(leftPos, window.innerWidth - 350 - 10));
  
      switch (modalType) {
        case "destination":
        case "destinationSearch":
          setDestinationModalPosition({ top: 350, left: leftPos });
          break;
        case "date":
          setDateModalPosition({ top: 350, left: leftPos });
          break;
        case "theme":
          setThemeModalPosition({ top: 350, left: leftPos });
          break;
        case "people":
          setPeopleModalPosition({ top: 350, left: leftPos });
          break;
        default:
          break;
      }
      setActiveModal(modalType);
    }
  };  

  const closeModal = () => {
    setActiveModal(null);
  };

  /* 여행 갤러리 데이터 */
  const galleryData = [
    {
      img: "https://placehold.co/215x160",
      subtitle: "자연과 도시가 공존한 제주도",
      description: "AI 일정 짜기로 예약해서 다녀봤는데 매일 가족끼리 동선짜고 돌아다니면서 온전히 가족에게만 집중할 수 있어서...",
    },
    {
      img: "https://placehold.co/215x160",
      subtitle: "감성 가득한 경주 여행",
      description: "역사와 자연을 함께 즐길 수 있는 경주는 정말 멋진 여행지였습니다. 한옥에서 하룻밤 자며 전통을 느낄 수 있었어요!...",
    },
    {
      img: "https://placehold.co/215x160",
      subtitle: "여유로운 부산 바다 여행",
      description: "광안리 해변에서 노을을 보며 힐링한 순간이 가장 기억에 남습니다. AI 추천 덕분에 맛집도 놓치지 않았어요....",
    },
    {
      img: "https://placehold.co/215x160",
      subtitle: "서울의 야경이 멋진 여행",
      description: "남산 타워에서 내려다본 서울의 야경이 너무 예뻤어요! AI 일정 덕분에 혼잡한 시간대를 피할 수 있어서 좋았어요...",
    },
    {
      img: moreIcon,
      placeName: "",
      description: "",
      isLast: true,
    }
  ];

  //여정 추가
  const createTrip = async () => {
    if (!selectedDestination || !calendarDate || selectedTheme.length === 0 || !selectedPeople) {
      alert("여행지, 날짜, 테마를 모두 선택해주세요!");
      return;
    }

    const toDateString = (date) => date.toISOString().split("T")[0];
    const startDate = toDateString(calendarDate[0]);
    const endDate = toDateString(calendarDate[1]);

    const tripData = {
      destinations: selectedDestination,
      startDate: startDate,
      endDate: endDate,
      theme: selectedTheme.map((t) => themeMap[t]),
      companionType: selectedPeople.map((c) => companionMap[c]),
    };

    try {
      const res = await fetch("http://localhost:8080/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success && data.trip) {
        const tripId = data.trip.trip_id;

        if (selectedMode === "ai") {
          await fetch(`http://localhost:8080/schedule/${tripId}/generate-days`, {
            method: "POST",
            credentials: "include",
          });
        }

        navigate(`/schedule/${tripId}`);
      } else {
        console.error("tripData가 존재하지 않음:", data);
      }
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  return (
    <div className="main-container">
      {/* 검색 바 */}
      <div className="search-box" style={{ height: "auto" }}>
        <div className="button-container">
          <button
            className={`rounded-button ${selectedMode === "ai" ? "active" : ""}`}
            onClick={() => handleModeChange("ai")}
          >
            AI 일정
          </button>
          <button
            className={`text-button ${selectedMode === "manual" ? "active" : ""}`}
            onClick={() => handleModeChange("manual")}
          >
            직접 짜기
          </button>
        </div>
        <div className="search-content">
          <div
            className="search-field"
            ref={(el) => (searchFieldRefs.current["destination"] = el)}
            onClick={(e) => openModal("destination", e)}
          >
            <span className="placeholder-text">여행지</span>
            {selectedDestination && <span className="selected-text">{selectedDestination.join(", ")}</span>}
          </div>
          <div
            className="search-field"
            ref={(el) => (searchFieldRefs.current["date"] = el)}
            onClick={(e) => openModal("date", e)}
          >
            <span className="placeholder-text">여행 시작 - 여행 완료</span>
            {selectedDate && <span className="selected-text">{selectedDate}</span>}
          </div>
          <div
            className="search-field"
            ref={(el) => (searchFieldRefs.current["theme"] = el)}
            onClick={(e) => openModal("theme", e)}
            style={{ minHeight: selectedTheme.length > 0 ? "auto" : "70px" }}
          >
            <span className="placeholder-text">여행 테마</span>
            {selectedTheme.length > 0 && (
              <span className="selected-text">
                {selectedTheme.join(", ")}
              </span>
            )}
          </div>
          <div className="search-field" onClick={(e) => openModal("people", e)}>
            <span className="placeholder-text">동행 인원</span>
            {selectedPeople.length > 0 && (
              <span className="selected-text">
                {selectedPeople.join(", ")}
              </span>
            )}
          </div>
          <div className="schedule-button" onClick={createTrip}>일정 만들기</div>
        </div>
      </div>

      {/* 인기 여행지 */}
      <div className="popular-destinations">
        <div className="popular-title">인기 여행지</div>
        <div className="destination-list">
          {[
            { name: "서울", subtext: "서울특별시", places: "경복궁, 인사동, 명동, 남산, 광화문, 성수동, 잠실" },
            { name: "제주도", subtext: "제주특별자치도", places: "성산일출봉, 우도, 협재해변, 천지연폭포, 한라산" },
            { name: "부산", subtext: "부산광역시", places: "해운대, 광안리, 감천문화마을, 태종대, 자갈치시장" },
            { name: "인천", subtext: "인천광역시", places: "송도센트럴파크, 차이나타운, 을왕리해변, 강화도" },
            { name: "경주", subtext: "경상북도 경주시", places: "불국사, 첨성대, 동궁과 월지, 경주월드, 황리단길" },
          ].map((city, index) => (
            <div className="destination-card" key={index}>
              <img className="destination-image" src={`https://placehold.co/116x145`} alt={city.name} />
              <div className="destination-info">{city.name}</div>
              <div className="destination-subtext">{city.subtext}</div>
              <div className="destination-places">
                <span className="places-title">대표 관광지 |</span> {city.places}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 여행 갤러리 & 내 기록 */}
      <div className="gallery-records-container">
        <div className="travel-gallery">
          <div className="gallery-title">여행 갤러리</div>
          <div className="gallery-container">
            {galleryData.map((item, index) => (
              <div className={`gallery-card ${item.isLast ? "last-card" : ""}`} key={index}>
                <div className="gallery-card-inner">
                  <img className="gallery-image" src={item.img} alt="여행 이미지" />
                  {!item.isLast && <div className="gallery-subtitle">{item.subtitle}</div>}
                  <div className="gallery-description">{item.description}</div>
                  <div className="gallery-buttons">
                    <button className="gallery-button">DAY 보기</button>
                    <button className="gallery-button">여행 코스 보기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="my-records">
          <div className="records-title">내 기록</div>
          <div className="records-container">
            {[
              { img: "https://placehold.co/160x160", text: "2025년 2월 12일" },
              { img: "https://placehold.co/160x160", text: "2025년 2월 14일" },
              { img: "https://placehold.co/160x160", text: "2025년 2월 18일" },
              { isLast: true },
            ].map((record, index) => (
              <div
                key={index}
                className={`record-card ${record.isLast ? "last-rcard" : ""}`}
                style={!record.isLast ? { backgroundImage: `url(${record.img})` } : {}}
              >
                {!record.isLast ? (
                  <div className="record-text">{record.text}</div>
                ) : (
                  <img className="plus-icon" src={plusIcon} alt="추가" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 모달 구현 */}
      {/* 여행지 선택 모달 */}
      {activeModal === "destination" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...destinationModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>여행 지역을 선택해 주세요</h2>
            <div className="region-buttons">
              {["서울", "부산", "대구", "광주", "대전", "인천", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"].map((region) => (
                <button key={region} className={`region-btn ${selectedDestination === region ? "active" : ""}`} onClick={() => handleSelectDestination(region)}>
                  {region}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>완료</button>
          </div>
        </div>
      )}

      {/* 여행 날짜 선택 모달 */}
      {activeModal === "date" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...dateModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>여행 날짜를 선택해 주세요</h2>
            <Calendar
              onChange={handleDateChange}
              value={calendarDate}
              minDate={new Date()}
              selectRange={true}
              locale="ko-KR"
              className="custom-calendar"
              formatDay={formatCalendarDay}
              maxDetail="month"
              view="month"
              defaultView="month"
              showNeighboringMonth={true}

              
            />
            <button className="close-btn" onClick={confirmDateSelection}>완료</button>
          </div>
        </div>
      )}

      {/* 여행 테마 선택 모달 */}
      {activeModal === "theme" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...themeModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>여행 테마를 선택해 주세요</h2>
            <h5 className="theme-subtitle">다중 선택 가능</h5>
            <div className="theme-buttons">
              {Object.keys(themeMap).map((theme) => (
                <button key={theme} className={`theme-btn ${selectedTheme.includes(theme) ? "active" : ""}`} onClick={() => toggleTheme(theme)}>
                  {theme}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>완료</button>
          </div>
        </div>
      )}

      {/* 동행 인원 선택 모달 */}
      {activeModal === "people" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...peopleModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>동행 유형을 선택해 주세요</h2>
            <h5 className="theme-subtitle">다중 선택 가능</h5>
            <div className="people-options">
              {Object.keys(companionMap).map((companion) => {
                const isAloneSelected = selectedPeople.includes("혼자");
                const isOtherSelected = selectedPeople.some((item) => item !== "혼자");

                const isDisabled =
                  (isAloneSelected && companion !== "혼자") || (isOtherSelected && companion === "혼자");

                return (
                  <button
                    key={companion}
                    className={`companion-btn ${selectedPeople.includes(companion) ? "active" : ""}`}
                    onClick={() => !isDisabled && toggleCompanion(companion)}
                    disabled={isDisabled}
                    style={isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  >
                    {companion}
                  </button>
                );
              })}
            </div>
            <button className="close-btn" onClick={closeModal}>완료</button>
          </div>
        </div>
      )}

    <ChatBot />
    </div>
  );
};

export default Main;