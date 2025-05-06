import React, { useState } from "react";
import axios from "axios";

const TimePickerModal = ({ dayId, dayPlaceId, onClose, onTimeConfirm }) => {
    const [hour, setHour] = useState("09");
    const [minute, setMinute] = useState("00");
  
    const handleConfirm = async () => {
        const selectedTime = `${hour}:${minute}`;
    
        try {
            await axios.patch(`http://localhost:8080/schedule/day/${dayId}/dayplace/${dayPlaceId}/time`, {
            dayplace_time: selectedTime,
        });
        
            onTimeConfirm(dayPlaceId, selectedTime);
            onClose();
        } catch (error) {
        console.error("시간 저장 실패:", error);
            alert("시간 저장에 실패했어요.");
        }
    };
  
    return (
      <div className="timepicker-modal-overlay" onClick={onClose}>
        <div className="timepicker-modal" onClick={(e) => e.stopPropagation()}>
          <h3>방문 시간 선택</h3>
          <div className="timepicker-selects">
            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            :
            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              {["00", "15", "30", "45"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="timepicker-buttons">
            <button onClick={handleConfirm}>확인</button>
            <button onClick={onClose}>취소</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default TimePickerModal;