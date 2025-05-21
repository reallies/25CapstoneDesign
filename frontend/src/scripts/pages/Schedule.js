import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSchedule } from "../hooks/useSchedule";
import deleteIcon from "../../assets/images/delete.svg"
import KakaoMap from "../components/KakaoMap";
import InviteModal from "../components/InviteModal";
import AddFriendModal from "../components/AddFriendModal";
import PlaceSearchModal from "../components/PlaceSearchModal";
import "./Schedule.css";
import WeatherBox from "../components/WeatherBox";
import FeedbackModal from "../components/FeedbackModal";
import TimePickerModal from "../components/TimePIckerModal"

const Schedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  // 초대, 친구 추가 기능
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const inviteModalRef = useRef(null);
  const addModalRef = useRef(null);
  const inviteButtonRef = useRef(null);;
  
  //피드백 기능
  const [showFeedback, setShowFeedback] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState();
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedDayPlaceId, setSelectedDayPlaceId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [dayPlaceTimeMap, setDayPlaceTimeMap] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  
  const { trip_id } = useParams();
  const navigate = useNavigate();
  const {
    trip,
    days,
    activeDay,
    setActiveDay,
    handlePlaceSelect,
    onDragEnd,
    handleDeletePlace,
  } = useSchedule(trip_id);

  useEffect(() => {
    if (trip && trip.destinations.length > 0) {
      setSelectedCity(trip.destinations[0]);
      const newMap = {};
      trip.days.forEach((day)=>{
        day.places.forEach((p)=>{
          newMap[p.dayplace_id] = p.dayplace_time;
        });
      });
  
      setDayPlaceTimeMap(newMap);
    }

  }, [trip]);

  const toggleWeatherDropdown = () => {
    setIsWeatherDropdownOpen((prev) => !prev);
    const handleClickOutside = (e) => {
      const invite = inviteModalRef.current;
      const add = addModalRef.current;

      const clickedOutsideInvite = invite && !invite.contains(e.target);
      const clickedOutsideAdd = add && !add.contains(e.target);

      // 친구 추가만 열려 있고 바깥 클릭일 때
      if (isAddOpen && !isInviteOpen && clickedOutsideAdd) {
        setIsAddOpen(false);
        return;
      }

      // 친구 목록만 열려 있고 바깥 클릭일 때
      if (isInviteOpen && !isAddOpen && clickedOutsideInvite) {
        setIsInviteOpen(false);
        return;
      }

      // 둘 다 열려 있고, 둘 다 바깥 클릭일 때만 닫기
      if (
        isAddOpen &&
        isInviteOpen &&
        clickedOutsideAdd &&
        clickedOutsideInvite
      ) {
        setIsAddOpen(false);
        setIsInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  };


  //피드백 기능
  const handleFeedback = async () => {
    if (!showFeedback) {
      if (feedbacks.length === 0) {
        setShowFeedback(true);
        setLoadingFeedbacks(true);
        try {
          const res = await fetch(`http://localhost:8080/feedback/${trip_id}`);
          const data = await res.json();
          setFeedbacks(data.feedbacks);
        } catch (err) {
          console.error(" 첫 피드백 요청 실패", err);
          return; // fetch 실패하면 모달 안 열게 막기
        } finally {
          setLoadingFeedbacks(false);
        }
      }

      // 피드백 생성 or 캐시 완료되었을 때만 열기
      setShowFeedback(true);
    } else {
      // 다시 누르면 닫기
      setShowFeedback(false);
    }
};

  const handleDayplaceTime = (dayId, dayPlaceId) =>{
    setSelectedDayId(dayId);
    setSelectedDayPlaceId(dayPlaceId);
    setIsTimeModalOpen(true);
  }

  const filteredDays = activeDay === "ALL" ? days : [days[activeDay]];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDayIndex(null);
  };

  if (!trip) return null;

  return (
    <div className="schedule">
      {/* 타이틀 */}
      <div className="div">
        <div className="title-wrap">
          <div className="title">
            <div className="title-subname">AI 일정과 함께하는</div>
            <div className="title-name">{trip.title}</div>
          </div>
          <div className="title-edit">편집</div>
        </div>

        <div className="content">
          <div className="tag-container">
            {trip.destinations.map((d) => (
              <div className="tag" key={d}>#{d}</div>
            ))}
          </div>
          <div className="menu">
            <div className="menu-item" onClick={() => navigate(`/expenses/${trip_id}`)}>
              <div className="menu-text">가계부</div>
            </div>
            <div className="menu-item" onClick={() => setIsInviteOpen(true)} ref={inviteButtonRef}>
              <div className="menu-text">초대</div>
            </div>
            <div className="menu-item">
              <div className="menu-text">여행 일정</div>
            </div>
          </div>
        </div>

        {/* 날씨 */}
        <div className="weather">
          <div className="weather-header">
            <p className="weather-text">여행 기간 동안의 날씨 소식이에요</p>
            <div className="weather-dropdown-toggle" onClick={toggleWeatherDropdown}>
              장소별 날씨 보기
              <span className={`dropdown-arrow ${isWeatherDropdownOpen ? "rotate" : ""}`}>
                ∨
              </span>
            </div>
          </div>

          {/* 드롭다운 메뉴 */}
          {isWeatherDropdownOpen && (
            <div className="weather-dropdown">
              {trip.destinations.map((d) => (
                <div
                  className="dropdown-item"
                  key={d}
                  onClick={() => {
                    setSelectedCity(d); // 도시 선택
                    setIsWeatherDropdownOpen(false); // 드롭다운 닫기
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}
          {selectedCity && <WeatherBox city={selectedCity} destinations={trip.destinations || []} />
          }
        </div>
        
        {/* 탭 */}
        <div className="schedule-tab">
          <div className="day-tabs-left">
            <div className={`day-tab ${activeDay === "ALL" ? "active" : ""}`} onClick={() => setActiveDay("ALL")}>전체 보기</div>
            {days.map((_, idx) => (
              <div
                className={`day-tab ${activeDay === idx ? "active" : ""}`}
                key={idx}
                onClick={() => setActiveDay(idx)}
              >
                DAY {idx + 1}
              </div>
            ))}
          </div>

          {/* 피드백 버튼 */}
          <div className="feedback-btn-wrap">
          <button
            className="feedback-btn-alone"
            onClick={handleFeedback}
          >
            {showFeedback ? "지도로 돌아가기" : "? 피드백 받기"}
          </button>
          </div>
        </div>

        <div className="schedule-box">
          {/* 오른쪽 파트 */}
          <div className="view">
            {!showFeedback && (
              <>
              <div className="kakao-map">
                <KakaoMap days={days} />
              </div>
              </>
            )}

            {showFeedback && (
              <FeedbackModal
                tripId={trip_id}
                feedbacks={feedbacks}
                loading={loadingFeedbacks}
                onClose={() => setShowFeedback(false)}
                setFeedbacks={setFeedbacks}
                setLoadingFeedbacks={setLoadingFeedbacks}
              />
            )}
            
            {/* 장소 추가 모달 */}
            {isModalOpen && (
              <div className="place-modal-overlay">
                <PlaceSearchModal
                  isOpen={isModalOpen}
                  onClose={handleCloseModal}
                  onSelect={(place) => handlePlaceSelect(selectedDayIndex, place, setIsModalOpen)}
                />
              </div>
            )}

            {/* 시간 추가 모달 */}
            {isTimeModalOpen && (
              <div className="place-modal-overlay">
                <TimePickerModal
                  dayId={selectedDayId}
                  dayPlaceId={selectedDayPlaceId}
                  onClose={() => setIsTimeModalOpen(false)}
                  onTimeConfirm={(dayPlaceId, time) => {
                    setDayPlaceTimeMap((prev) => ({
                      ...prev,
                      [dayPlaceId]: time,
                    }));
                    setIsTimeModalOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* 왼쪽 파트 */}
          <div className="schedule-list">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="days" type="DAY">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {filteredDays.map((day, dayIndex) => (
                      <Draggable key={day.id} draggableId={day.id} index={dayIndex}>
                        {(provided) => (
                          <div
                            className={`day-card ${day.color}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <div className="day-header" {...provided.dragHandleProps}>
                              <div className="day-title">DAY {days.findIndex(d => d.id === day.id) + 1}</div>
                              <div className="day-date">{day.date}</div>
                              <div className="day-drag">≡</div>
                            </div>
                            {/*Place 순서 변경 부분*/}
                            <Droppable droppableId={`${day.id}-place`} type="PLACE">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {day.items.filter(item => item.type === "place").length === 0 && (
                                    <div className="empty-placeholder" />
                                  )}
                                  {day.items
                                    .filter((item) => item.type === "place")
                                    .map((item, itemIndex) => (
                                      <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                        {(provided) => (
                                          <div
                                            className="schedule-item"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <div className="item-number">
                                              {itemIndex + 1}
                                            </div> 
                                            <div className="item-content">
                                              <div className="item-content2">
                                                <div className="place-type">{item.placeType}</div>
                                                <div className="time" onClick={() => handleDayplaceTime(Number(day.id.replace("day-","")), item.dayPlaceId)}>
                                                  {dayPlaceTimeMap[item.dayPlaceId] || "time"}
                                                </div>
                                              </div>
                                              <div className="place-name">{item.name}</div>
                                            </div>
                                            <div className="item-actions">
                                              <img src={deleteIcon} alt="삭제" className="delete-icon" onClick={() => handleDeletePlace(day.id, item.dayPlaceId)} />
                                              <div className="item-drag">≡</div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {/* 추가 버튼 */}
                            <div className="add-buttons">
                              <div className="action-btn" onClick={() => { setSelectedDayIndex(days.indexOf(day)); setIsModalOpen(true); }}>장소 추가</div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;