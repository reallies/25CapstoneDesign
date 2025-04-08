import React, { useState } from "react";
import "./SettleUpModal.css";

const SettleUpModal = ({ isOpen, onClose, totalAmount = 100000, friends = [] }) => {
  const [selected, setSelected] = useState([]);

  if (!isOpen) return null;

  const perPerson = selected.length > 0 ? Math.floor(totalAmount / selected.length) : 0;

  const toggleSelect = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  return (
    <div className="settleup-modal-wrapper" onClick={onClose}>
      <div className="settleup-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="settleup-close-btn" onClick={onClose}>✕</button>
        <h2 className="settleup-title">정산하기</h2>
        <p className="settleup-amount">{totalAmount.toLocaleString()}</p>
        <p className="settleup-sub">지출할 친구</p>

        <div className="settleup-list">
          {friends.map((friend, idx) => (
            <div className="settleup-row" key={idx}>
              <div className="settleup-avatar" />
              <span className="settleup-name">{friend}</span>
              <span className="settleup-value">
                {selected.includes(friend) ? perPerson.toLocaleString() : 0}
              </span>
              <button
                className={`settleup-select-btn ${selected.includes(friend) ? "active" : ""}`}
                onClick={() => toggleSelect(friend)}
              >
                선택
              </button>
            </div>
          ))}
        </div>

        <button className="settleup-confirm-btn" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default SettleUpModal;