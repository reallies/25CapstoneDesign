import React, { useState } from "react";
import map from "../../assets/images/map.svg";
import back from  "../../assets/images/back.svg"
import search2 from  "../../assets/images/search2.svg"
import "./Schedule.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";

export const Schedule = () => {
  const [activeDay, setActiveDay] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [days, setDays] = useState([
    {
      id: "day-1",
      date: "| 25.03.12 수",
      color: "red",
      items: [
        { id: "item-1", type: "place", placeType: "관광명소", name: "전주 중앙 공원" },
        { id: "item-2", type: "place", placeType: "관광명소", name: "전주 수목원" },
        { id: "item-3", type: "place", placeType: "모험·액티비티", name: "전주 한옥 레일바이크" },
      ],
    },
    {
      id: "day-2",
      date: "| 25.03.13 목",
      color: "orange",
      items: [
        { id: "item-4", type: "place", placeType: "숙소", name: "전주 한옥 호텔" },
        { id: "item-5", type: "place", placeType: "관광명소", name: "전주 수목원" },
        { id: "item-6", type: "place", placeType: "모험·액티비티", name: "전주 한옥 레일바이크" },
      ],
    },
    {
      id: "day-3",
      date: "| 25.03.14 금",
      color: "purple",
      items: [
        { id: "item-7", type: "place", placeType: "관광명소", name: "전주 중앙 공원" },
        { id: "item-8", type: "place", placeType: "관광명소", name: "전주 수목원" },
        { id: "item-9", type: "place", placeType: "모험·액티비티", name: "전주 한옥 레일바이크" },
      ],
    },
  ]);

  const handleAddMemo = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].items.push({
      id: `memo-${new Date().getTime()}`,
      type: "memo",
      content: "",
    });
    setDays(newDays);
  };

  const handleMemoChange = (dayIndex, itemIndex, value) => {
    const newDays = [...days];
    newDays[dayIndex].items[itemIndex].content = value;
    setDays(newDays);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    if (result.type === "DAY") {
      const newDays = [...days];
      const [movedDay] = newDays.splice(result.source.index, 1);
      newDays.splice(result.destination.index, 0, movedDay);
      setDays(newDays);
    } else {
      const sourceDayIndex = days.findIndex((day) => day.id === result.source.droppableId);
      const destDayIndex = days.findIndex((day) => day.id === result.destination.droppableId);
      const newDays = [...days];
      const [movedItem] = newDays[sourceDayIndex].items.splice(result.source.index, 1);
      newDays[destDayIndex].items.splice(result.destination.index, 0, movedItem);
      setDays(newDays);
    }
  };

const filteredDays = activeDay === "ALL" ? days : [days[activeDay]];
const handleCloseModal = () => setIsModalOpen(false);
const [searchText, setSearchText] = useState("");
const [isFocused, setIsFocused] = useState(false);
const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);

const toggleWeatherDropdown = () => {
  setIsWeatherDropdownOpen(prev => !prev);
};


  return (
    <div className="schedule">
        {/* 타이틀 */}
        <div className="div">
            <div className="title-wrap">
              <div className="title">
                  <div className="title-subname">AI 일정과 함께하는</div>
                  <div className="title-name">전북 여행</div>
              </div>
            <div className="title-edit">편집</div>
        </div>

        <div className="content">
          <div className="tag-container">
            <div className="tag">#전주시</div>
            <div className="tag">#익산시</div>
            <div className="tag">#군산시</div>
          </div>
          <div className="menu">
          <div className="menu-item" onClick={() => navigate("/expenses")}>
            <div className="menu-text">가계부</div>
          </div>
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
            <div className="dropdown-item">전주시</div>
            <div className="dropdown-item">익산시</div>
            <div className="dropdown-item">군산시</div>
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
                              <div className="day-title">DAY {dayIndex + 1}</div>
                              <div className="day-date">{day.date}</div>
                              <div className="day-drag">≡</div>
                            </div>

                            <Droppable droppableId={day.id} type="ITEM">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {day.items.map((item, itemIndex) => (
                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                      {(provided) => (
                                        item.type === "place" ? (
                                          <div className="schedule-item"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <div className="item-number">
                                              {day.items.filter(it => it.type === "place").indexOf(item) + 1}
                                            </div>
                                            <div className="item-content">
                                              <div className="place-type">{item.placeType}</div>
                                              <div className="place-name">{item.name}</div>
                                            </div>
                                            <div className="item-drag">≡</div>
                                          </div>
                                        ) : (
                                          <div className="memo-item"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <textarea
                                              className="memo-input"
                                              placeholder="메모 입력란"
                                              value={item.content}
                                              onChange={(e) => handleMemoChange(days.indexOf(day), itemIndex, e.target.value)}
                                            />
                                            <div className="item-drag">≡</div>
                                          </div>
                                        )
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            <div className="add-buttons">
                            <div className="action-btn" onClick={() => setIsModalOpen(true)}>장소 추가</div>
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
                        <img 
                        src={back}
                        alt="뒤로가기"
                        className="back"
                        onClick={handleCloseModal}
                        />
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
                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">전주 한옥마을</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>

                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">전주향교</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>

                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">국립무형유산원</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>

                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">전동성당</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>

                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">전주 중앙 공원</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>

                        <div className="place-item">
                            <div className="place-thumb" />
                            <div className="place-info">
                            <div className="place-name">전주 수목원</div>
                            <div className="place-location">전주</div>
                            </div>
                            <button className="select-btn">선택</button>
                        </div>
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
