import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../components/InviteModal";

const LoginModal = ({ isOpen, onClose,user, onFriendClick, isFriendModalOpen, onCloseFriendModal }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // "나의 일정" 클릭 시 페이지 이동 함수
  const handleMyScheduleClick = () => {
    navigate("/myschedule"); 
    onClose();
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // 새로고침 or 상태 초기화 필요
    window.location.href = "/";
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-top">
          <img src={user?.image_url && !user.nickname?.startsWith("temp_") ? user.image_url : userIcon}
            alt="user"
            className="login-user-icon"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
          <div className="login-nickname">
            {user?.nickname && !user.nickname.startsWith("temp_") ? (
              <>
              <strong>{user?.nickname || "사용자"}</strong>
              <span className="nickname-suffix">님</span>
              </>
            ) : (
                <strong>아이디를 입력해주세요!</strong>  
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
        </div>

        <div className="login-menu-container">
          <div className="login-menu">
            <span>마이페이지</span>
            <div className="menu-divider" />
            <span onClick={handleMyScheduleClick} style={{ cursor: "pointer" }}>
              나의 일정
            </span>
            <div className="menu-divider" />
            <span onClick={onFriendClick} style={{ cursor: "pointer" }} >나의 친구</span>
          </div>
        </div>
        {isFriendModalOpen && (
          <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100 }}>
            <InviteModal
              onClose={onCloseFriendModal}
              onAddFriendClick={() => {}}
              modalRef={null}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default LoginModal;