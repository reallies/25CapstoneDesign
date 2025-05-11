import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../components/InviteModal";
import AddFriendModal from "../components/AddFriendModal";

// 로그인 후 유저 정보 및 메뉴를 보여주는 모달 컴포넌트
const LoginModal = ({ isOpen, onClose, user, onFriendClick, isFriendModalOpen, onCloseFriendModal }) => {
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const loginModalRef = useRef(null);
  const inviteWrapperRef = useRef(null);

  // 모달 열릴 때 내부 모달 초기화
  useEffect(() => {
    if (isOpen) {
      setIsInviteOpen(false);
      setIsAddOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 마이페이지 이동
  const handleMyPageClick = () => {
    navigate("/mypage");
    onClose();
  };

  // 나의 일정 페이지 이동
  const handleMyScheduleClick = () => {
    navigate("/myschedule"); // 이 경로는 App.js의 Route에 맞춰 조정하세요
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
    <>
      {/* 전체 모달 영역 클릭 시 닫힘 */}
      <div className="login-modal-backdrop"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        {/* 모달 박스 본문 */}
        <div
          className="login-modal-box"
          ref={loginModalRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 유저 정보 영역 */}
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
            <span onClick={handleMyPageClick} style={{ cursor: "pointer" }}>마이페이지</span>
            <div className="menu-divider" />
            <span onClick={handleMyScheduleClick} style={{ cursor: "pointer" }}>
              나의 일정
            </span>
            <div className="menu-divider" />
            <span>나의 친구</span>
          </div>
        </div>
      </div>
    </div >

    {
      isFriendModalOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100 }}>
          <InviteModal
            onClose={onCloseFriendModal}
            onAddFriendClick={() => { }}
            modalRef={null}
          />
        </div>
      )
}


{/* 친구 초대 모달 */ }
{
  isInviteOpen && (
    <div className="invite-wrapper" ref={inviteWrapperRef} onClick={(e) => e.stopPropagation()}>
      <InviteModal
        onClose={() => {
          setIsInviteOpen(false);
          setIsAddOpen(false);
        }}
        onAddFriendClick={() => setIsAddOpen(true)}
        modalRef={{ current: null }}
      />
    </div>
  )
}

{/* 친구 추가 모달 (친구 모달 내부에서 열림) */ }
{
  isInviteOpen && isAddOpen && (
    <div className="addfriend-wrapper" onClick={(e) => e.stopPropagation()}>
      <AddFriendModal
        onClose={() => setIsAddOpen(false)}
        anchorRef={inviteWrapperRef}
        modalRef={{ current: null }}
      />
    </div>
  )
}
  </>
  );
};

export default LoginModal;
