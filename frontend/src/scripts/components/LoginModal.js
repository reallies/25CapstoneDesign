import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import userIcon from "../../assets/images/user.svg";

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // "나의 일정" 클릭 시 페이지 이동 함수
  const handleMyScheduleClick = () => {
    navigate("/myschedule"); // 이 경로는 App.js의 Route에 맞춰 조정하세요
    onClose();
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-top">
          <img src={userIcon} alt="user" className="login-user-icon" />
          <div className="login-nickname">
            <strong>상상부기</strong>
            <span className="nickname-suffix">님</span>
          </div>
          <button className="logout-btn">로그아웃</button>
        </div>

        <div className="login-menu-container">
          <div className="login-menu">
            <span>마이페이지</span>
            <div className="menu-divider" />
            <span onClick={handleMyScheduleClick} style={{ cursor: "pointer" }}>
              나의 일정
            </span>
            <div className="menu-divider" />
            <span>나의 친구</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;