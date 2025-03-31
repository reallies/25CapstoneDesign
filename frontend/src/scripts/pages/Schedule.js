import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import map from "../../assets/images/map.svg";
import back from "../../assets/images/back.svg";
import search2 from "../../assets/images/search2.svg";
import "./Schedule.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Schedule = () => {
  const { trip_id } = useParams();
  const [days, setDays] = useState([]);
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const toggleWeatherDropdown = () => {
    setIsWeatherDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.trip) {
          setTrip(data.trip);
          const convertedDays = data.trip.days.map((day, index) => ({
            id: `day-${index + 1}`,
            date: `| ${new Date(day.date).toLocaleDateString("ko-KR", {
              month: "2-digit",
              day: "2-digit",
              weekday: "short",
            })}`,
            color: ["red", "orange", "purple"][index % 3],
            items: day.places.map((p, idx) => ({
              id: `item-${p.place.place_id}`,
              type: "place",
              placeType: p.place_type || "관광명소",
              name: p.place.place_name,
            })),
          }));
          setDays(convertedDays);
        } else {
          console.error("여행 정보를 불러오지 못함:", data);
        }
      } catch (err) {
        console.error("에러 발생:", err);
      }
    };

    fetchTrip();
  }, [trip_id]);

  const handleAddMemo = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].items.push({
      id: `memo-${Date.now()}`,
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

      const originalDates = days.map(d => d.date); 
      const updatedDays = newDays.map((day, idx) => ({
        ...day,
        date: originalDates[idx],
      }));

      setDays(updatedDays);
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
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedDayIndex(null);}
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);

  //장소 선택 핸들러함수
  const handlePlaceSelect = async (dayIndex, place) => {
    const day = days[dayIndex];
    const dayId = day.id.replace("day-", ""); // 예: day-1 → 1
  
    try {
      const res = await fetch(`http://localhost:8080/schedule/${trip_id}/day/${dayId}/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          kakao_place_id: place.kakao_place_id,
          place_name: place.place_name,
          place_address: place.place_address,
          place_latitude: place.latitude,
          place_longitude: place.longitude,
          place_image_url: place.image_url || "",
          place_star: place.place_star,
          place_call_num: place.call,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.place) {
        const newDays = [...days];
        newDays[dayIndex].items.push({
          id: `item-${data.place.place_id}`,
          type: "place",
          name: data.place.place_name,
          placeType: "관광명소",
        });
        setDays(newDays);
        setIsModalOpen(false);
      } else {
        alert("장소 추가 실패");
      }
    } catch (err) {
      console.error("장소 추가 실패:", err);
      alert("추가 중 오류 발생!");
    }
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
                              <div className="action-btn" onClick={() => {
                                setSelectedDayIndex(days.indexOf(day));
                                setIsModalOpen(true);
                                }}>장소 추가</div>
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
                  {/* 이곳은 추후 API로 대체할 예정 */}
                  {["전주 한옥마을", "전주향교", "국립무형유산원", "전동성당"].map((name, idx) => (
                    <div className="place-item" key={idx}>
                      <div className="place-thumb" />
                      <div className="place-info">
                        <div className="place-name">{name}</div>
                        <div className="place-location">전주</div>
                      </div>
                      <button className="select-btn" onClick={()=>{
                        handlePlaceSelect(selectedDayIndex, {
                          kakao_place_id: "123456",
                          place_name: name,
                          place_address: "전주시 완산구 교동",
                          latitude: 35.82,
                          longitude: 127.15,
                          image_url: "",
                          place_star: null,
                          call: "063-123-4567",
                          }
                        )
                      }}>선택</button>
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
