import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import ChatBot from "../components/ChatBot";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import moreIcon from "../../assets/images/more.svg";
import plusIcon from "../../assets/images/plus.svg";

const Home = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [calendarDate, setCalendarDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("ai");
  const searchFieldRefs = useRef({});
  const navigate = useNavigate();
  const alertShownRef = useRef(false);

  // AI / 직접 일정 핸들러
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  // 모달 위치
  const [destinationModalPosition, setDestinationModalPosition] = useState({ top: 250, left: 100 });
  const [dateModalPosition, setDateModalPosition] = useState({ top: 300, left: 200 });
  const [themeModalPosition, setThemeModalPosition] = useState({ top: 350, left: 300 });
  const [peopleModalPosition, setPeopleModalPosition] = useState({ top: 400, left: 400 });

  // 여행지 선택 핸들러
  const handleSelectDestination = (region) => {
    if (selectedDestinations.includes(region)) {
      setSelectedDestinations(prev => prev.filter((r) => r !== region));
    } else {
      if (selectedDestinations.length >= 3) {
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          alert("최대 3개까지만 선택 가능합니다.");
          setTimeout(() => {
            alertShownRef.current = false;
          }, 1000);
        }
        return;
      }
  
      const updated = [...selectedDestinations, region];
      setSelectedDestinations(updated);
      setDestinationInput(updated.join(", "));
    }
  };


  // 여행 테마 토글 핸들러
  const toggleTheme = (theme) => {
    setSelectedTheme((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // 동행 유형 토글 핸들러
  const toggleCompanion = (companion) => {
    setSelectedCompanions((prev) =>
      prev.includes(companion)
        ? prev.filter((item) => item !== companion)
        : [...prev, companion]
    );
  };  

  // 날짜 선택 확인
  const confirmDateSelection = () => {
    if (Array.isArray(calendarDate) && calendarDate.length === 2) {
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
        {/* 여행지 필드 */}
        <div 
          className="search-field" 
          ref={(el) => (searchFieldRefs.current["destination"] = el)}
          onClick={(e) => openModal("destination", e)}
        >
          <span className="placeholder-text">여행지</span>
          <input
          type="text"
          value={destinationInput}
          onClick={(e) => {
            e.stopPropagation();
            openModal("destination", e);
          }}
          onChange={(e) => {
            const value = e.target.value;
            setDestinationInput(value);
            if (value.trim() !== "") {
              openModal("destinationSearch", e);
            }
          }}
        />
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
            <span className="placeholder-text">동행 유형</span>
            {selectedCompanions.length > 0 && (
              <span className="selected-text">
                {selectedCompanions.join(", ")}
              </span>
            )}
          </div>
          <div 
            className="schedule-button"
            onClick={() => navigate("/schedules")}
            style={{ cursor: "pointer" }}
          >
            일정 만들기
          </div>
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
            <h5 className="theme-subtitle">다중 선택 가능</h5>
            <div className="region-buttons">
            {["서울", "부산", "대구", "광주", "대전", "인천", "경기", "강원", "충북", "전북", "경남", "제주"].map((region) => (
              <button
                key={region}
                className={`region-btn ${selectedDestinations.includes(region) ? "active" : ""}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedDestinations((prev) => {
                    let updated;
                    if (prev.includes(region)) {
                      updated = prev.filter((r) => r !== region);
                    } else {
                      if (prev.length >= 3) {
                        alert("최대 3개까지만 선택 가능합니다.");
                        return prev;
                      }
                      updated = [...prev, region];
                    }
                    setDestinationInput(updated.join(", "));
                    return updated;
                  });
                }}
              >
                {region}
              </button>
            ))}
            </div>
            <button className="close-btn" onClick={() => {
              setDestinationInput(selectedDestinations.join(", "));
              closeModal();
            }}>완료</button>
          </div>
        </div>
      )}
      {activeModal === "destinationSearch" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...destinationModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>검색 결과</h2>
            <h5 className="theme-subtitle">다중 선택 가능</h5>
            <div className="region-buttons">
              {["영종도", "여수", "인천", "양양", "전주", "전남", "전국"]
                .filter(region => region.includes(destinationInput))
                .map((region) => (
                  <button
                    key={region}
                    className={`region-btn ${selectedDestinations.includes(region) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDestination(region);
                    }}
                  >
                    {region}
                  </button>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}

      {/* 여행 날짜 선택 모달 */}
      {activeModal === "date" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            style={{ ...dateModalPosition }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>여행 날짜를 선택해 주세요</h2>
            <Calendar
              onChange={(date) => {
                if (Array.isArray(date) && date.length === 2) {
                  const start = date[0];
                  const end = date[1];
                  const diffInTime = end.getTime() - start.getTime();
                  const diffInDays = diffInTime / (1000 * 3600 * 24);

                  if (diffInDays > 7) {
                    alert("여행 기간은 최대 7일까지 선택 가능합니다.");
                    return;
                  }
                }
                setCalendarDate(date);
              }}
              value={calendarDate}
              minDate={new Date()}
              selectRange={true}
              locale="ko-KR"
              className="custom-calendar"
              formatDay={(locale, date) => {
                const day = date.getDate();
                return day < 10 ? `0${day}` : `${day}`;
              }}
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
              {["모험·액티비티", "SNS 핫플", "랜드마크", "문화·역사", "이벤트·축제", "감성·자연", "쇼핑", "여유·힐링", "맛집"].map((theme) => (
                <button key={theme} className={`theme-btn ${selectedTheme.includes(theme) ? "active" : ""}`} onClick={() => toggleTheme(theme)}>
                  {theme}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>완료</button>
          </div>
        </div>
      )}

      {/* 동행 유형 선택 모달 */}
      {activeModal === "people" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ ...peopleModalPosition }} onClick={(e) => e.stopPropagation()}>
            <h2>동행 유형을 선택해 주세요</h2>
            <h5 className="theme-subtitle">다중 선택 가능</h5>
            <div className="people-options">
              {["혼자", "연인", "친구", "배우자", "부모님", "형제·자매", "회사·동료", "반려동물", "동호회·취미", "기타"].map((companion) => (
                <button
                  key={companion}
                  className={`companion-btn ${selectedCompanions.includes(companion) ? "active" : ""}`}
                  onClick={() => toggleCompanion(companion)}
                >
                  {companion}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>완료</button>
          </div>
        </div>
      )}

      <ChatBot />

    </div>
  );
};

export default Home;