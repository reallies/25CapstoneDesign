//Home.js
import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
import ChatBot from "../components/ChatBot";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import moreIcon from "../../assets/images/more.svg";
import plusIcon from "../../assets/images/plus.svg";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/AlertModal";
import PlaceHolder from "../../assets/images/placeholder.png"; // 임시 이미지 경로

const Home = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [calendarDate, setCalendarDate] = useState(null);
  const [posts, setPosts] = useState([]);
  const [myRecords, setMyRecords] = useState([]);

  const navigate = useNavigate();
  const searchFieldRefs = useRef({});

  const alertShownRef = useRef(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");


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

  // 모달 위치
  const [destinationModalPosition, setDestinationModalPosition] = useState({ top: 250, left: 100 });
  const [dateModalPosition, setDateModalPosition] = useState({ top: 300, left: 200 });
  const [themeModalPosition, setThemeModalPosition] = useState({ top: 350, left: 300 });
  const [peopleModalPosition, setPeopleModalPosition] = useState({ top: 400, left: 400 });

  //갤러리 렌더링 요청
  useEffect(() => {
    fetch('http://localhost:8080/posts/gallery', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
      })
      .catch(console.error);
  }, []);

  // 내 기록 렌더링 요청
  useEffect(() => {
    fetch('http://localhost:8080/posts/me', { credentials: 'include' })
      .then(res => res.json())
      .then(({ posts }) => {

        setMyRecords(posts || []);
      })
      .catch(console.error);
  }, []);


  // 앞 3개만 출력 제한, 나머지는 "더보기" 카드로
  const visiblePosts = posts.slice(0, 4);
  const hasMore = posts.length > 3;

  const visibleRecords = myRecords.slice(0, 4);
  const hasMoreRecords = myRecords.length > 4;


  // 여행지 선택 핸들러 - 최대 3개까지 선택
  const handleSelectDestination = (region) => {
    setSelectedDestination((prev) => {
      if (prev.includes(region)) {
        return prev.filter((r) => r !== region);
      } else if (prev.length < 3) {
        return [...prev, region];
      } else {
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          setAlertText("여행지는 최대 3개까지만 선택 가능합니다.");
          setAlertOpen(true);
          setTimeout(() => {
            alertShownRef.current = false;
          }, 1000);
        }
        return prev;
      }
    });

    const updated = [...selectedDestination, region];
    setSelectedDestination(updated);
    setDestinationInput(updated.join(", "));
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
        <div className="search-content">
          <div
            className="search-field"
            ref={(el) => (searchFieldRefs.current["destination"] = el)}
            onClick={(e) => openModal("destination", e)}
          >
            <span className="field-label">여행지</span>

            <div className="input-wrapper">
              {destinationInput === "" && (
                <span className="custom-placeholder">여행지 검색</span>
              )}
              {selectedDestination && <span className="selected-text">{selectedDestination.join(" ")}</span>}

            </div>
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
            { name: "서울", subtext: "서울특별시", places: "경복궁, 인사동, 명동, 남산, 광화문, 성수동, 잠실", image: `${process.env.PUBLIC_URL}/images/Seoul_Scenery.webp` },
            { name: "경주", subtext: "경상북도 경주시", places: "불국사, 첨성대, 동궁과 월지, 경주월드, 황리단길", image: `${process.env.PUBLIC_URL}/images/Gyeongju_Scenery.webp` },
            { name: "부산", subtext: "부산광역시", places: "해운대, 광안리, 감천문화마을, 태종대, 자갈치시장", image: `${process.env.PUBLIC_URL}/images/Busan_Scenery.jpg` },
            { name: "제주도", subtext: "제주특별자치도", places: "성산일출봉, 우도, 협재해변, 천지연폭포, 한라산", image: `${process.env.PUBLIC_URL}/images/Jeju_Scenery.jpg` },
          ].map((city, index) => (
            <div className="destination-card" key={index}>
              <img className="destination-image" src={city.image} alt={city.name} />
              <div className="destination-info">{city.name}</div>
              <div className="destination-subtext">{city.subtext}</div>
              <div className="destination-places">
                <span className="places-title">대표 관광지 |</span> {city.places}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 여행 갤러리 */}
      <div className="gallery-records-container">
        <div className="travel-gallery">
          <div className="gallery-title">여행 갤러리</div>
          <div className="gallery-container">
            {visiblePosts.map(post => {
              // content를 부제목/본문으로 분리
              const [subtitle, ...rest] = post.content.split(/\r?\n\r?\n/);
              const mainContent = rest.join('\n\n');

              // 이미지 URL이 없으면 placeholder
              const imgUrl =
                Array.isArray(post.image_urls) && post.image_urls[0]
                  ? post.image_urls[0]
                  : PlaceHolder;

              return (
                <div key={post.post_id} className="gallery-card">
                  <div className="gallery-card-inner">
                    <img
                      className="gallery-image"
                      src={imgUrl}
                      alt={post.title || '여행 이미지'}
                    />
                    <div className="gallery-subtitle">{post.title || '제목 없음'}</div>
                    <p className="gallery-description">
                      {mainContent.length > 60
                        ? mainContent.slice(0, 60) + '…'
                        : mainContent}
                    </p>
                    <button
                      className="gallery-button"
                      onClick={() => navigate(`/gallery-detail/${post.post_id}`)}
                    >
                      게시글 보기
                    </button>
                  </div>
                </div>
              );
            })}

            {hasMoreRecords && (
              <div
                className="gallery-card last-card"
                onClick={() => {
                  navigate('/gallery')
                  window.scrollTo(0, 0);    // 이동하자마자 최상단으로 스크롤
                }}
              >
                <div className="gallery-card-inner">
                  <img
                    className="more-icon"
                    src={moreIcon}
                    alt="더보기"
                  />
                </div>
              </div>
            )}
          </div>




        </div>
        {/* 내 기록 */}
        <div className="my-records">
          <div className="records-title">내 기록</div>
          <div className="records-container">
            {visibleRecords.length === 0 ? (
              // 1) 리뷰가 하나도 없을 때
              <div className="myrecord-empty-msg">
                내가 쓴 리뷰가 없습니다. <br />
                리뷰를 작성해주세요.
              </div>
            ) : (
              // 2) 리뷰가 있을 때만 이 부분을 렌더
              <>
                {visibleRecords.map((post) => {
                  const imgUrl =
                    Array.isArray(post.image_urls) && post.image_urls[0];
                  const dateText = new Date(post.created_at).toLocaleDateString(
                    'ko-KR',
                    { year: 'numeric', month: '2-digit', day: '2-digit' }
                  );
                  return (
                    <div
                      key={post.post_id}
                      className="record-card"
                      style={
                        imgUrl
                          ? { backgroundImage: `url(${imgUrl})` }
                          : { backgroundColor: '#e0e0e0' }
                      }
                      onClick={() => navigate(`/gallery-detail/${post.post_id}`)}
                    >
                      <div className="record-text">{dateText}</div>
                    </div>
                  );
                })}

                {/* 더보기 카드 (리뷰가 하나라도 있을 때만) */}
                {hasMore && (
                  <div
                    className="record-card last-rcard"
                    onClick={() => navigate('/gallery')}
                  >
                    <img className="plus-icon" src={plusIcon} alt="추가" />
                  </div>
                )}
              </>
            )}
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
              {["서울", "부산", "대구", "광주", "대전", "인천", "경주", "강릉", "여수", "평창", "거제", "제주"].map((region) => (
                <button
                  key={region}
                  className={`region-btn ${selectedDestination.includes(region) ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDestination((prev) => {
                      let updated;
                      if (prev.includes(region)) {
                        updated = prev.filter((r) => r !== region);
                      } else {
                        if (prev.length >= 3) {
                          setAlertText("여행지는 최대 3개까지만 선택 가능합니다.");
                          setAlertOpen(true);
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
              setDestinationInput(selectedDestination.join(", "));
              closeModal();
            }}>완료</button>
          </div>
        </div>
      )}

      {/* 임시 다중 선택창 */}
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
                    className={`region-btn ${selectedDestination.includes(region) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDestination(region);
                    }}
                  >
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
              onChange={(date) => {
                if (Array.isArray(date) && date.length === 2) {
                  const start = date[0];
                  const end = date[1];
                  const diffInTime = end.getTime() - start.getTime();
                  const diffInDays = diffInTime / (1000 * 3600 * 24);

                  if (diffInDays > 7) {
                    setAlertText("여행 기간은 최대 7일까지 선택 가능합니다.");
                    setAlertOpen(true);
                    return;
                  }
                }
                handleDateChange(date);
              }}
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
              {Object.keys(themeMap).map((theme) => {
                // 이미 선택된 개수가 3개이고,
                // 이 버튼의 테마가 아직 선택되지 않았다면 비활성화
                const isDisabled =
                  selectedTheme.length >= 3 && !selectedTheme.includes(theme);

                return (
                  <button
                    key={theme}
                    className={`theme-btn ${selectedTheme.includes(theme) ? "active" : ""}`}
                    onClick={() => !isDisabled && toggleTheme(theme)}
                    disabled={isDisabled}
                    style={{
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {theme}
                  </button>
                );
              })}
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

      {/* 하단 챗봇 컴포넌트 */}
      <ChatBot />

      {/* 경고 모달 */}
      {alertOpen && (
        <AlertModal text={alertText} onClose={() => setAlertOpen(false)} />
      )}
    </div>
  );
};

export default Home;