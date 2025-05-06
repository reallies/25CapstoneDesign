import React, { useState, useEffect } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSchedule } from "../hooks/useSchedule";
import deleteIcon from "../../assets/images/delete.svg"
import KakaoMap from "../components/KakaoMap";
import PlaceSearchModal from "../components/PlaceSearchModal";
import InviteModal from "../components/InviteModal";
import AddFriendModal from "../components/AddFriendModal";
import "./Schedule.css";
import WeatherBox from "../components/WeatherBox";
import FeedbackModal from "../components/FeedbackModal";
import TimePickerModal from "../components/TimePIckerModal"

const Schedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  // 새로운 상태 추가
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState();
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedDayPlaceId, setSelectedDayPlaceId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [dayPlaceTimeMap, setDayPlaceTimeMap] = useState({});

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
    }
  }, [trip]);

  // 새로운 이벤트 핸들러
  const handleExpensesClick = () => {
    navigate(`/expenses/${trip_id}`);
  };

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleAddFriendClick = () => {
    setIsAddFriendModalOpen(true);
  };

  const handleFeedback = () =>{
    setShowFeedback(true);
    setLoadingFeedbacks(true);
  }
  const handleDayplaceTime = (dayId, dayPlaceId) =>{
    setSelectedDayId(dayId);
    setSelectedDayPlaceId(dayPlaceId);
    setIsTimeModalOpen(true);
  }

  // 기존 함수
  const toggleWeatherDropdown = () => {
    setIsWeatherDropdownOpen((prev) => !prev);
  };

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
            <div className="menu-item" onClick={handleExpensesClick}>
              <div className="menu-text">가계부</div>
            </div>
            <div className="menu-item" onClick={handleInviteClick}>
              <div className="menu-text">초대</div>
            </div>
            <div className="menu-item">
              <div className="menu-text">내 기록</div>
            </div>
          </div>
        </div>

        {/* 날씨 */}
        <div className="weather">
          <div className="weather-header">
            <p className="weather-text">여행 기간 동안의 날씨 소식이에요</p>
            <div className="weather-dropdown-toggle" onClick={toggleWeatherDropdown}>
              장소별 날씨 보기
              <span className={`dropdown-arrow ${isWeatherDropdownOpen ? "rotate" : ""}`}>∨</span>
            </div>
          </div>
          {isWeatherDropdownOpen && (
            <div className="weather-dropdown">
              {trip.destinations.map((d) => (
                <div
                  className="dropdown-item"
                  key={d}
                  onClick={() => {
                    setSelectedCity(d);
                    setIsWeatherDropdownOpen(false);
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}
          {selectedCity && <WeatherBox city={selectedCity} destinations={trip.destinations || []} />}
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
            ? 피드백 받기
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
                <div className="satellite">
                  <div className="satellite-text">위성 보기</div>
                </div>
              </div>
              </>
            )}

            {showFeedback && (
              <FeedbackModal tripId={trip_id} onClose={() => setShowFeedback(false)} />
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

      {/* InviteModal 렌더링 */}
      {isInviteModalOpen && (
        <InviteModal
          onClose={() => setIsInviteModalOpen(false)}
          onAddFriendClick={handleAddFriendClick}
          tripId={trip_id} // trip_id 전달
          modalRef={null} // 필요 시 ref 추가
        />
      )}

      {/* AddFriendModal 렌더링 */}
      {isAddFriendModalOpen && (
        <AddFriendModal
          onClose={() => setIsAddFriendModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Schedule;