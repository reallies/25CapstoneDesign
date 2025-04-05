import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  // 여행 목록 불러오기
  const fetchMyTrips = async () => {
    try {
      const res = await fetch("http://localhost:8080/schedule/myTrips", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.trips) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error("여행 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const handleTripClick = (tripId) => {
    navigate(`/schedule/${tripId}`);
  };

  if (trips.length === 0) return <div>생성한 여행이 없습니다.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>나의 여행 목록</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {trips.map((trip) => (
          <div
            key={trip.trip_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => handleTripClick(trip.trip_id)}
          >
            <h3>{trip.title}</h3> {/* 여행 제목만 출력 */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;
