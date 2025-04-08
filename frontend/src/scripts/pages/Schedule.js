import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSchedule } from "../hooks/useSchedule";
import map from "../../assets/images/map.svg";
import back from "../../assets/images/back.svg";
import search2 from "../../assets/images/search2.svg";
import deleteIcon from "../../assets/images/delete.svg"
import "./Schedule.css";

const Schedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const { trip_id } = useParams();
  const {
    trip,
    days,
    activeDay,
    setActiveDay,
    handlePlaceSelect,
    handleAddMemo,
    handleMemoChange,
    onDragEnd,
    handleDeletePlace,
  } = useSchedule(trip_id);

  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
  
  //날씨 부분
  const toggleWeatherDropdown = () => {
    setIsWeatherDropdownOpen((prev) => !prev);
  };

  const filteredDays = activeDay === "ALL" ? days : [days[activeDay]];

  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setSelectedDayIndex(null);
  };

  if (!trip) return null;

  //예시 장소 - 카카오 api 연결시 삭제
  const dummyPlaces = [
    {
      kakao_place_id: "kakao-001",
      place_name: "전주 한옥마을",
      place_address: "전주시 완산구 교동",
      latitude: 35.815,
      longitude: 127.150,
      image_url: "",
      place_star: null,
      call: "063-111-1111",
    },
    {
      kakao_place_id: "kakao-002",
      place_name: "전주향교",
      place_address: "전주시 완산구 향교길",
      latitude: 35.812,
      longitude: 127.155,
      image_url: "",
      place_star: null,
      call: "063-222-2222",
    },
  ];


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
            <div className="menu-item"><div className="menu-text">가계부</div></div>
            <div className="menu-item"><div className="menu-text">초대</div></div>
            <div className="menu-item"><div className="menu-text">내 기록</div></div>
          </div>
        </div>

        {/* 날씨 */}
        <div className="weather">
          <div className="weather-background" />
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
                <div className="dropdown-item" key={d}>{d}</div>
              ))}
            </div>
          )}
        </div>

        {/* 탭 */}
        <div className="schedule-tab">
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

        {/* 일정 */}
        <div className="schedule-box">
          <div className="view">
            <img className="image" alt="지도" src={map} />
          </div>

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
                              <div className="day-title">DAY {days.findIndex(d => d.id === day.id)+1}</div>
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
                                              <div className="place-type">{item.placeType}</div>
                                              <div className="place-name">{item.name}</div>
                                            </div>
                                            <img src = {deleteIcon} alt="삭제" className="delete-icon" onClick={()=> handleDeletePlace(day.id, item.dayPlaceId)} />
                                            <div className="item-drag">≡</div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            {/*MEMO 순서 변경 부분*/}
                            <Droppable droppableId={`${day.id}-memo`} type="MEMO">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {day.items
                                    .filter((item) => item.type === "memo")
                                    .map((item, itemIndex) => (
                                      <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                        {(provided) => (
                                          <div
                                            className="memo-item"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <textarea
                                              className="memo-input"
                                              placeholder="메모 입력란"
                                              value={item.content}
                                              onChange={(e) =>
                                                handleMemoChange(dayIndex, itemIndex, e.target.value)
                                              }
                                            />
                                            <div className="item-drag">≡</div>
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
                              <div className="action-btn" onClick={() => handleAddMemo(days.indexOf(day))}>메모 추가</div>
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

          <div className="delete">
            <div className="delete-text">장소 삭제</div>
          </div>

          {/* 장소 추가 모달 */}
          {isModalOpen && (
            <div className="place-modal-wrap">
              <div className="place-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <img src={back} alt="뒤로가기" className="back" onClick={handleCloseModal} />
                  {/* 검색창 */}
                  <div className="search-container">
                    <input
                      type="text"
                      className="modal-search"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={isFocused ? "" : "장소 검색"}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        if (searchText === "") setIsFocused(false);
                      }}
                    />
                    <img src={search2} alt="돋보기" className="search-icon" />
                  </div>
                </div>

                <div className="place-list">
                  {dummyPlaces.map((place, idx) => (
                    <div className="place-item" key={idx}>
                      <div className="place-thumb" />
                      <div className="place-info">
                        <div className="place-name">{place.place_name}</div>
                        <div className="place-location">전주</div>
                      </div>
                      <button className="select-btn" onClick={() => handlePlaceSelect(selectedDayIndex, place, setIsModalOpen)}>
                        선택
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
