import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../components/InviteModal";

const LoginModal = ({ isOpen, onClose,user }) => {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const inviteModalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsInviteOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMyPage = () =>{
    navigate("/mypage");
    onClose();
  }

  // "나의 일정" 클릭 시 페이지 이동 함수
  const handleMyScheduleClick = () => {
    navigate("/myschedule"); 
    onClose();
  };

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
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
          <button className="logout-btn" onClick={handleLogout} style={{ marginTop: 0}}>로그아웃</button>
        </div>

        <div className="login-menu-container">
          <div className="login-menu">
            <span onClick={handleMyPage} style={{ cursor: "pointer" }}>마이페이지</span>
            <div className="menu-divider" />
            <span onClick={handleMyScheduleClick} style={{ cursor: "pointer" }}>
              나의 일정
            </span>
            <div className="menu-divider" />

            <span onClick={()=> setIsInviteOpen(true)} style={{ cursor: "pointer" }}>나의 친구</span>
          </div>
        </div>

        {isInviteOpen && (
          <InviteModal
            position={{top: "143px", left: "-145px"}}
            onClose={() => {
              setIsInviteOpen(false);
            }}
            modalRef={inviteModalRef}
          />
        )}

      </div>
    </div>
  );
};
export default LoginModal;