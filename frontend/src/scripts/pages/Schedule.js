import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import map from "../../assets/images/map.svg";
import back from "../../assets/images/back.svg";
import search2 from "../../assets/images/search2.svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./Schedule.css";

const Schedule = () => {
  const {trip_id} = useParams();
  const [days, setDays] = useState([]);
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);

  const toggleWeatherDropdown = () => {
    setIsWeatherDropdownOpen((prev) => !prev);
  };

  const fetchTrip = async () => {
    try {
      const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.trip) {
        setTrip(data.trip);
        const convertedDays = data.trip.days.map((day, index) => {
          const d = new Date(day.date);
        
          return {
            id: `day-${day.day_id}`,
            date: `| ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} - ${d.toLocaleDateString("ko-KR", { weekday: "short" })}`,
            color: ["red", "orange", "purple"][index % 3],
            items: day.places.map((p) => ({
              id: `item-${p.place.place_id}`,
              dayPlaceId: p.id,
              type: "place",
              placeType: p.place_type || "관광명소",
              name: p.place.place_name,
            })),
          };
        });
        setDays(convertedDays);
      }
    } catch (err) {
      console.error("여행 정보를 불러오지 못함:", err);
    }
  };

  useEffect(() => {
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

  //드래그해서 이동
  const onDragEnd = async(result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    //Day 순서 변경
    if (type === "DAY") {
      const newDays = [...days];
      const [movedDay] = newDays.splice(result.source.index, 1);
      newDays.splice(destination.index, 0, movedDay);
      setDays(newDays);
      return;
      }

    //장소,메모 이동처리
    const sourceDayIndex = days.findIndex((d) => d.id === source.droppableId);
    const destDayIndex = days.findIndex((d) => d.id === destination.droppableId);
    const movedItem = days[sourceDayIndex].items[source.index];

    if (movedItem.type === "memo") {
      const newDays = [...days];
      const [removed] = newDays[sourceDayIndex].items.splice(source.index, 1);
      newDays[destDayIndex].items.splice(destination.index, 0, removed);
      setDays(newDays);
      return;
    }

    // 즉시 순서가 바뀜
    const newDays = [...days];
    const [moved] = newDays[sourceDayIndex].items.splice(source.index, 1);
    newDays[destDayIndex].items.splice(destination.index, 0, moved);
    setDays(newDays);

    try {
      const res = await fetch(`http://localhost:8080/schedule/${trip_id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          previous: {
            day_id: Number(days[sourceDayIndex].id.replace("day-", "")),
            dayPlace_id: movedItem.dayPlaceId,
          },
          present: {
            day_id: Number(days[destDayIndex].id.replace("day-", "")),
            order: destination.index + 1,
          },
        }),
      });
      if (res.ok) {
        await fetchTrip();

      } else {
        console.error("서버 응답 실패");
      }
    } catch (error) {
      console.error("드래그 이동 실패", error);
    }
  };

  //장소 선택 핸들함수
  const handlePlaceSelect = async (dayIndex, place) => {
    const day = days[dayIndex];
    const dayId = Number(day.id.replace("day-", ""));
  
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
  
      if (res.ok && data.data) {
        const newDays = [...days];
        newDays[dayIndex].items.push({
          id: `item-${data.data.place.place_id}`,
          dayPlaceId: data.data.dayPlace.id,
          type: "place",
          name: data.data.place.place_name,
          placeType: "관광명소",
        });
        setDays(newDays);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("장소 추가 실패:", err);
      alert("추가 중 오류 발생!");
    }
  };

  const filteredDays = activeDay === "ALL" ? days : [days[activeDay]];
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedDayIndex(null);}
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
                  {dummyPlaces.map((place, idx) => (
                    <div className="place-item" key={idx}>
                      <div className="place-thumb" />
                      <div className="place-info">
                        <div className="place-name">{place.place_name}</div>
                        <div className="place-location">전주</div>
                      </div>
                      <button className="select-btn" onClick={() => handlePlaceSelect(selectedDayIndex, place)}>
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
