import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import userIcon from "../../assets/images/user.svg";
import InviteModal from "../components/InviteModal";
import AddFriendModal from "../components/AddFriendModal";

// 로그인 후 유저 정보 및 메뉴를 보여주는 모달 컴포넌트
const LoginModal = ({ isOpen, onClose }) => {
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
    navigate("/myschedule");
    onClose();
  };

  return (
    <>
      {/* 전체 모달 영역 클릭 시 닫힘 */}
      <div className="login-modal-backdrop" onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}>
        {/* 모달 박스 본문 */}
        <div
          className="login-modal-box"
          ref={loginModalRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 유저 정보 영역 */}
          <div className="login-modal-top">
            <img src={userIcon} alt="user" className="login-user-icon" />
            <div className="login-nickname">
              <strong>상상부기</strong>
              <span className="nickname-suffix">님</span>
            </div>
            <button className="logout-btn">로그아웃</button>
          </div>

          {/* 하단 메뉴 영역 */}
          <div className="login-menu-container">
            <div className="login-menu">
              <span onClick={handleMyPageClick}>마이페이지</span>
              <div className="menu-divider" />
              <span onClick={handleMyScheduleClick}>나의 일정</span>
              <div className="menu-divider" />
              <span onClick={(e) => {
                e.stopPropagation();
                setIsInviteOpen(true);
              }}>
                나의 친구
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 친구 초대 모달 */}
      {isInviteOpen && (
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
      )}

      {/* 친구 추가 모달 (친구 모달 내부에서 열림) */}
      {isInviteOpen && isAddOpen && (
        <div className="addfriend-wrapper" onClick={(e) => e.stopPropagation()}>
          <AddFriendModal
            onClose={() => setIsAddOpen(false)}
            anchorRef={inviteWrapperRef}
            modalRef={{ current: null }}
          />
        </div>
      )}
    </>
  );
};

export default LoginModal;
