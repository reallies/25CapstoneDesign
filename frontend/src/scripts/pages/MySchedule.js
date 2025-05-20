import React, { useEffect, useState } from "react";
import "./MySchedule.css";
import { useNavigate } from "react-router-dom";

const MySchedule = () => {
  const [sortOrder, setSortOrder] = useState("recent");
  const [trips, setTrips] = useState([]); // 사용자가 생성한 일정
  const [acceptedInvitations, setAcceptedInvitations] = useState([]); // 초대받아 수락한 일정
  const navigate = useNavigate();

  // 날짜 형식 변환 함수
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 사용자가 생성한 여행 목록 불러오기
  const fetchMyTrips = async () => {
    try {
      const res = await fetch("http://localhost:8080/schedule/myTrips", {
        credentials: "include",
      });
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error("여행 목록 불러오기 실패:", err);
    }
  };

  // 초대받아 수락한 여행 목록 불러오기
  const fetchAcceptedInvitations = async () => {
    try {
      const res = await fetch("http://localhost:8080/trip/invitations/accepted", {
        credentials: "include",
      });
      const data = await res.json();
      setAcceptedInvitations(data.invitations || []);
    } catch (err) {
      console.error("수락한 초대 일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchMyTrips();
    fetchAcceptedInvitations();

    // 초대 수락 이벤트 리스너 추가
    const handleInvitationAccepted = () => {
      fetchAcceptedInvitations(); // 초대 수락 후 초대된 일정 목록 새로고침
    };

    window.addEventListener("invitationAccepted", handleInvitationAccepted);

    return () => {
      window.removeEventListener("invitationAccepted", handleInvitationAccepted);
    };
  }, []);

  // 통합된 일정 목록 (생성한 일정 + 초대받아 수락한 일정)
  const allTrips = [
    ...trips.map((trip) => ({ ...trip, type: "created" })),
    ...acceptedInvitations.map((inv) => ({
      trip_id: inv.trip_id,
      title: inv.trip_title,
      start_date: inv.start_date,
      end_date: inv.end_date,
      destinations: inv.destinations,
      updated_at: inv.updated_at,
      type: "invited",
      inviter_nickname: inv.inviter_nickname,
    })),
  ];

  // 정렬 함수
  const sortedTrips = [...allTrips].sort((a, b) => {
    const dateA = new Date(a.updated_at);
    const dateB = new Date(b.updated_at);
    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  // 여행 자세히 보기
  const handleViewTrip = (tripId) => {
    navigate(`/schedule/${tripId}`);
  };

  // 여행 삭제 (사용자가 생성한 일정만 삭제 가능)
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
        <button className="myschedule-create-btn" onClick={() => navigate("/")}>
          + 일정 만들기
        </button>
      </div>

      <div className="myschedule-sort-buttons">
        <button
          className={`sort-btn ${sortOrder === "recent" ? "active" : ""}`}
          onClick={() => setSortOrder("recent")}
        >
          최근순
        </button>
        <button
          className={`sort-btn ${sortOrder === "oldest" ? "active" : ""}`}
          onClick={() => setSortOrder("oldest")}
        >
          오래된순
        </button>
      </div>

      {sortedTrips.length === 0 ? (
        <p className="empty-text">일정이 없습니다.</p>
      ) : (
        <div className="myschedule-list">
          {sortedTrips.map((trip) => (
            <div key={trip.trip_id} className="schedule-card">
              <div className="schedule-placeholder" />
              <div className="schedule-info">
                <h3 className="schedule-title">
                  {trip.title}
                  {trip.type === "invited" && (
                    <span className="invited-label"> (초대됨)</span>
                  )}
                </h3>
                <div className="schedule-tags">
                  {trip.destinations.map((tag, index) => (
                    <span key={index} className="schedule-tag">{`#${tag}`}</span>
                  ))}
                </div>
                <p className="schedule-date">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </p>
                {trip.type === "invited" && (
                  <p className="inviter-info">초대한 사람: {trip.inviter_nickname}</p>
                )}
              </div>
              <div className="schedule-buttons">
                <button
                  className="view-btn"
                  onClick={() => handleViewTrip(trip.trip_id)}
                >
                  자세히 보기
                </button>
                {trip.type === "created" && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTrip(trip.trip_id)}
                  >
                    삭제하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySchedule;