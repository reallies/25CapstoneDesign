import React, { useEffect, useState } from "react";
import "./MySchedule.css";
import { useNavigate } from "react-router-dom";

const MySchedule = () => {
  const [sortOrder, setSortOrder] = useState("recent"); 
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  // 날짜 형식 변환 함수
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

   //여행 목록 불러오기
   const fetchMyTrips = async () => {
    try {
      const res = await fetch("http://localhost:8080/schedule/myTrips", {
        credentials: "include",
      });
      const data = await res.json();
      setTrips(data.trips);
    } catch (err) {
      console.error("여행 목록 불러오기 실패:", err);
    }
  };

  useEffect(()=>{
    fetchMyTrips();
  },[]);

  //여행 시간 순 정렬
  const handleSortClick = (order) => {
    setSortOrder(order);
    setTrips((prev) =>
      [...prev].sort((a, b) =>
        order === "recent"
          ? new Date(b.updated_at) - new Date(a.updated_at)
          : new Date(a.updated_at) - new Date(b.updated_at)
      )
    );
  };

  //여행 자세히보기 버튼
  const handleViewTrip = (tripId) => {
    navigate(`/schedule/${tripId}`);
  };

  //여행삭제 버튼
  const handleDeleteTrip = async (tripId) => {
    try {
      await fetch(`http://localhost:8080/schedule/${tripId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setTrips((prev) => prev.filter((trip) => trip.trip_id !== tripId));
    } catch (err) {
      console.error("여행 삭제 중 에러:", err);
    }
  };

  return (
    <div className="myschedule-wrapper">
      <div className="myschedule-header">
        <h2 className="myschedule-title">나의 일정</h2>
        <button className="myschedule-create-btn" onClick={()=>navigate("/")}>+ 일정 만들기</button>
      </div>

      <div className="myschedule-sort-buttons">
        <button
          className={`sort-btn ${sortOrder === "recent" ? "active" : ""}`}
          onClick={() => handleSortClick("recent")}
        >
          최근순
        </button>
        <button
          className={`sort-btn ${sortOrder === "oldest" ? "active" : ""}`}
          onClick={() => handleSortClick("oldest")}
        >
          오래된순
        </button>
      </div>

      {trips.length === 0 ? (
        <p className="empty-text"></p>
      ) : (
      <div className="myschedule-list">
        {trips.map((trip) => (
            <div key={trip.trip_id} className="schedule-card">
              <div className="schedule-placeholder" />
              <div className="schedule-info">
                  <h3 className="schedule-title">{trip.title}</h3>
                  <div className="schedule-tags">
                    {trip.destinations.map((tag, index) => (
                    <span key={index} className="schedule-tag">{`#${tag}`}</span>
                    ))}
                  </div>
                  <p className="schedule-date">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
              </div>
              <div className="schedule-buttons">
                  <button className="view-btn" onClick={() => handleViewTrip(trip.trip_id)}>자세히 보기</button>
                  <button className="delete-btn" >삭제하기</button>
              </div>
            </div>
        ))}
      </div>
      )}
    </div>
  );
};


export default MySchedule;