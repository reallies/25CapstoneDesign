import React, { useState } from "react";
import "./MySchedule.css";

const schedules = [
    {
      id: 1,
      title: "전북 여행",
      tags: ["#전주시", "#익산시", "#군산시"],
      date: "2025.03.12 - 2025.03.14",
    },
    {
      id: 2,
      title: "부산 당일치기 여행",
      tags: ["#부산시"],
      date: "2024.11.04",
    },
    {
      id: 3,
      title: "경주 역사 기행",
      tags: ["#경주시"],
      date: "2024.05.21 - 2024.05.22",
    },
  ];  

const MySchedule = () => {
  const [sortOrder, setSortOrder] = useState("recent"); 

  const handleSortClick = (order) => {
    setSortOrder(order);
  };

  return (
    <div className="myschedule-wrapper">
      <div className="myschedule-header">
        <h2 className="myschedule-title">나의 일정</h2>
        <button className="myschedule-create-btn">+ 일정 만들기</button>
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

      <div className="myschedule-list">
        {schedules.map((item) => (
            <div key={item.id} className="schedule-card">
            <div className="schedule-placeholder" />
            <div className="schedule-info">
                <h3 className="schedule-title">{item.title}</h3>
                <div className="schedule-tags">
                {item.tags.map((tag, index) => (
                    <span key={index} className="schedule-tag">{tag}</span>
                ))}
                </div>
                <p className="schedule-date">{item.date}</p>
            </div>
            <div className="schedule-buttons">
                <button className="view-btn">자세히 보기</button>
                <button className="delete-btn">삭제하기</button>
            </div>
            </div>
        ))}
        </div>
    </div>
  );
};

export default MySchedule;