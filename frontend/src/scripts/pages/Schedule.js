//Schedule.js
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSchedule } from "../hooks/useSchedule";
import deleteIcon from "../../assets/images/delete.svg";
import deleteIcon2 from "../../assets/images/trash.svg";
import KakaoMap from "../components/KakaoMap";
import InviteModal from "../components/InviteModal";
import PlaceSearchModal from "../components/PlaceSearchModal";
import "./Schedule.css";
import WeatherBox from "../components/WeatherBox";
import FeedbackModal from "../components/FeedbackModal";
import TimePickerModal from "../components/TimePickerModal";
import ChatBot from "../components/ChatBot";

const Schedule = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const weatherDropdownRef = useRef(null);

    // 초대, 친구 추가 기능
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const inviteModalRef = useRef(null);
    const inviteButtonRef = useRef(null);

    // 피드백 기능
    const [showFeedback, setShowFeedback] = useState(false);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState();
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [selectedDayPlaceId, setSelectedDayPlaceId] = useState(null);
    const [selectedDayId, setSelectedDayId] = useState(null);
    const [dayPlaceTimeMap, setDayPlaceTimeMap] = useState({});
    const [feedbacks, setFeedbacks] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");

    const [imageStates, setImageStates] = useState({});
    const [hoverStates, setHoverStates] = useState({});
    
    const handleMouseEnter = (itemId) => {
        setHoverStates(prev => ({ ...prev, [itemId]: true }));
    };

    const handleMouseLeave = (itemId) => {
        setHoverStates(prev => ({ ...prev, [itemId]: false }));
        setImageStates(prev => ({ ...prev, [itemId]: false }));
    };
    const handleDeleteClick = (itemId, dayId, dayPlaceId) => {
        if (!imageStates[itemId]) {
            setImageStates(prev => ({ ...prev, [itemId]: true }));
        } else {
            handleDeletePlace(dayId, dayPlaceId); // 두 번째 클릭 시 삭제
        }
    };

    const { trip_id } = useParams();
    const navigate = useNavigate();
    const {
        trip,
        days,
        activeDay,
        setActiveDay,
        handlePlaceSelect,
        onDragEnd,
        fetchTrip,
        handleDeletePlace,
        handleUpdateTitle
    } = useSchedule(trip_id);

    useEffect(() => {
        if (trip && trip.destinations.length > 0) {
            setSelectedCity(trip.destinations[0]);
            const newMap = {};
            trip.days.forEach((day) => {
                day.places.forEach((p) => {
                    newMap[p.dayplace_id] = p.dayplace_time;
                });
            });
            setDayPlaceTimeMap(newMap);
        }
    }, [trip]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const invite = inviteModalRef.current;
            const clickedOutsideInvite = invite && !invite.contains(e.target);

            const weatherDropdown = weatherDropdownRef.current;
            const clickedOutsideWeather = weatherDropdown && !weatherDropdown.contains(e.target);

            if (isInviteOpen && clickedOutsideInvite) {
                setIsInviteOpen(false);
            }

            if (isWeatherDropdownOpen && clickedOutsideWeather) {
                setIsWeatherDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isInviteOpen, isWeatherDropdownOpen]);

    const toggleWeatherDropdown = () => {
        setIsWeatherDropdownOpen((prev) => !prev);
    };

    // 피드백 기능
    const handleFeedback = async () => {
        if (!showFeedback) {
            if (feedbacks.length === 0) {
                setShowFeedback(true);
                setLoadingFeedbacks(true);
                try {
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/feedback/${trip_id}`);
                    const data = await res.json();
                    setFeedbacks(data.feedbacks);
                } catch (err) {
                    console.error(" 첫 피드백 요청 실패", err);
                    return; // fetch 실패하면 모달 안 열게 막기
                } finally {
                    setLoadingFeedbacks(false);
                }
            }
            setShowFeedback(true);
        } else {
            setShowFeedback(false);
        }
    };

    const handleDayplaceTime = (dayId, dayPlaceId) => {
        setSelectedDayId(dayId);
        setSelectedDayPlaceId(dayPlaceId);
        setIsTimeModalOpen(true);
    };

    const filteredDays = activeDay === "ALL" ? days : [days[activeDay]];

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDayIndex(null);
    };

    // New function to handle saving the title
    const handleSaveTitle = async () => {
        if (editedTitle.trim() === "") {
            return;
        }
        await handleUpdateTitle(editedTitle);
        setIsEditingTitle(false);
    };

    if (!trip) return null;

    return (
        <div className="schedule">
            <div className="div">
                <div className="title-wrap">
                    {isEditingTitle ? (
                        <div className="title-edit-container">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="title-input"
                            />
                            <button onClick={handleSaveTitle}>Save</button>
                            <button onClick={() => setIsEditingTitle(false)}>Cancel</button>
                        </div>
                    ) : (
                        <>
                            <div className="title">
                                <div className="title-subname">AI 일정과 함께하는</div>
                                <div className="title-name">{trip.title}</div>
                            </div>
                            <div
                                className="title-edit"
                                onClick={() => {
                                    setIsEditingTitle(true);
                                    setEditedTitle(trip.title);
                                }}
                            >
                                편집
                            </div>
                        </>
                    )}
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
                    </div>
                </div>

                {isInviteOpen && (
                    <InviteModal
                        position={{top: "345px", left: "88px"}}
                        onClose={() => {
                            setIsInviteOpen(false);
                        }}
                        tripId={trip_id}
                        modalRef={inviteModalRef}
                    />
                )}

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
                        <div className="weather-dropdown" ref={weatherDropdownRef}>
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
                        <button className="feedback-btn-alone" onClick={handleFeedback}>
                            {showFeedback ? "지도로 돌아가기" : "? 피드백 받기"}
                        </button>
                    </div>
                </div>

                <div className="schedule-box">
                  {/* 오른쪽 파트 */}
                    <div className="view">
                        {!showFeedback && (
                            <div className="kakao-map">
                                <KakaoMap days={filteredDays} />
                            </div>
                        )}

                        {showFeedback && (
                            <FeedbackModal
                                tripId={trip_id}
                                feedbacks={feedbacks}
                                loading={loadingFeedbacks}
                                onClose={() => setShowFeedback(false)}
                                setFeedbacks={setFeedbacks}
                                setLoadingFeedbacks={setLoadingFeedbacks}
                                fetchTrip={fetchTrip}
                            />
                        )}

                        {/* 장소 추가 모달 */}
                        {isModalOpen && (
                            <PlaceSearchModal
                                isOpen={isModalOpen}
                                onClose={handleCloseModal}
                                onSelect={(place) => handlePlaceSelect(selectedDayIndex, place, setIsModalOpen)}
                            />
                        )}

                        {/* 시간 추가 모달 */}
                        {isTimeModalOpen && (
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
                        )}
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
                                                                                        onMouseEnter={() => handleMouseEnter(item.id)}
                                                                                        onMouseLeave={() => handleMouseLeave(item.id)}
                                                                                    >
                                                                                        <div className="item-number">
                                                                                            {itemIndex + 1}
                                                                                        </div>
                                                                                        <div className="item-content">
                                                                                            <div className="place-name">{item.name}</div>
                                                                                            <div className="item-content2">
                                                                                                <div className="time-label" onClick={() => handleDayplaceTime(Number(day.id.replace("day-", "")), item.dayPlaceId)}
                                                                                                     style={{
                                                                                                        color: dayPlaceTimeMap[item.dayPlaceId] ? "#919191" : "#00ADB5",
                                                                                                        fontWeight: dayPlaceTimeMap[item.dayPlaceId] ? "bold" : "normal",
                                                                                                        }}
                                                                                                    >
                                                                                                    {dayPlaceTimeMap[item.dayPlaceId] || "시간 선택"}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="item-actions">
                                                                                            {hoverStates[item.id] && (
                                                                                                <img src={imageStates[item.id] ? deleteIcon : deleteIcon2} alt="삭제" className="delete-icon" onClick= {()=> handleDeleteClick(item.id, day.id, item.dayPlaceId)} />
                                                                                            )}
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
                {/* 하단 챗봇 컴포넌트 */}
                <ChatBot />
            </div>
        </div>
    );
};

export default Schedule;