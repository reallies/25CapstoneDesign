import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Schedule = () => {
  const { trip_id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("전체"); // "전체" 또는 Day1, Day2, ...

  const fetchTrip = async () => {
    try {
      const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
        credentials: "include", // AccessToken이 필요한 경우 추가
      });
      const data = await res.json();

      if (res.ok && data.trip) {
        setTrip(data.trip);
      } else {
        console.error("여행 정보를 불러오지 못함:", data);
      }
    } catch (error) {
      console.error("에러 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [trip_id]);

  if (loading) return <div>로딩 중...</div>;
  if (!trip) return <div>여행 정보를 불러올 수 없습니다.</div>;

  const handleDayClick = (index) => {
    setViewMode(`Day${index + 1}`);
  };

  const filteredDays =
    viewMode === "전체"
      ? trip.days
      : [trip.days[parseInt(viewMode.replace("Day", "")) - 1]];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🗺️ 여행 제목: {trip.title}</h2>
      <p><strong>여행지:</strong> {trip.destinations.join(", ")}</p>
      <p><strong>기간:</strong> {new Date(trip.start_date).toLocaleDateString()} ~ {new Date(trip.end_date).toLocaleDateString()}</p>

      {/* 🔽 네비게이션 버튼 */}
      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setViewMode("전체")} style={{ marginRight: "1rem" }}>
          📅 전체 보기
        </button>
        {trip.days.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(index)}
            style={{
              marginRight: "0.5rem",
              backgroundColor: viewMode === `Day${index + 1}` ? "#ddd" : "#fff",
            }}
          >
            Day {index + 1}
          </button>
        ))}
      </div>

      {/* 🔽 일정 보기 */}
      {filteredDays.map((day, index) => (
        <div key={day.day_id} style={{ marginTop: "1.5rem" }}>
          <h4>📌 Day {trip.days.indexOf(day) + 1} - {new Date(day.date).toLocaleDateString()}</h4>
          {day.places.length > 0 ? (
            <ol>
              {day.places.map((dp) => (
                <li key={dp.place.place_id}>
                  <strong>{dp.place.place_name}</strong> ({dp.place.place_address})
                </li>
              ))}
            </ol>
          ) : (
            <p>아직 장소가 추가되지 않았어요.</p>
          )}
          {/* 🔽 여기에 장소 추가 폼 넣을 수 있음 */}
          <button onClick={() => alert("여기에 장소 추가 모달 열기")}>장소 추가</button>
        </div>
      ))}
    </div>
  );
};

export default Schedule;
