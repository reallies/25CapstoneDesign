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

      const sortedTrips = [...data.trips].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      setTrips(sortedTrips);
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

  //이미지 리스트
  const imageMap = {
    "제주": "/regionImages/jeju.jpg",
    "서울": "/regionImages/seoul.jpg",
    "부산": "/regionImages/busan.jpg",
    "대전": "/regionImages/daejeon.jpg",
    "대구": "/regionImages/daegu.jpg",
    "광주": "/regionImages/gwangju.jpg",
    "인천": "/regionImages/incheon.jpg",
    "경주": "//regionImages/gyeongju.jpg",
    "강릉": "/regionImages/gangneung.jpg",
    "여수": "/regionImages/yeosu.jpg",
    "평창": "/regionImages/pyeongchang.jpg",
    "거제": "/regionImages/geoje.jpg",
    "기본": "/regionImages/default.jpg"
  };

  const getImageByDestinations = (destinations) => {
  const regions = destinations.slice(0, 3); // 최대 3개까지만 사용
  const images = regions.map(region => imageMap[region] || imageMap["기본"]);

  if (images.length === 1) {
    return (
      <div className="image-single" style={{ backgroundImage: `url(${images[0]})` }} />
    );
  }

  if (images.length === 2) {
    return (
      <div className="image-diagonal">
        <div className="diagonal-half left" style={{ backgroundImage: `url(${images[0]})` }} />
        <div className="diagonal-half right" style={{ backgroundImage: `url(${images[1]})` }} />
      </div>
    );
  }

  // 3개인 경우 ㅅ 모양
  if (images.length === 3) {
    return (
      <div className="image-split-s">
        <div className="slice slice1" style={{ backgroundImage: `url(${images[0]})` }} />
        <div className="slice slice2" style={{ backgroundImage: `url(${images[1]})` }} />
        <div className="slice slice3" style={{ backgroundImage: `url(${images[2]})` }} />
      </div>
    );
  }

  return null;
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
              <div className="schedule-placeholder">
                {getImageByDestinations(trip.destinations)}
              </div>

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
                  <button className="delete-btn" onClick={() => handleDeleteTrip(trip.trip_id)}>삭제하기</button>
              </div>
            </div>
        ))}
      </div>
      )}
    </div>
  );
};


export default MySchedule;