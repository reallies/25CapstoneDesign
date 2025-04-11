import React, { useState } from "react";
import "./InviteModal.css";
import search2 from "../../assets/images/search2.svg";

const InviteModal = ({ onClose, onAddFriendClick, modalRef }) => {
  const [activeTab, setActiveTab] = useState("friend");

  // 초기 더미 친구 목록
  const initialFriendList = ["상상부기", "상찌", "한성냥이", "꼬꼬꾸꾸", "멍멍이", "냥냥이"];
  const initialRequestList = ["예비부기", "상상몽"];
  const initialInviteList = ["망상부기"];

  // 상태 관리
  const [pendingInvites, setPendingInvites] = useState([]);
  const [friendListState, setFriendListState] = useState(initialFriendList);
  const [requestListState, setRequestListState] = useState(initialRequestList);
  const [inviteListState, setInviteListState] = useState(initialInviteList);

  // 현재 탭에 따라 출력할 리스트 반환
  const getListByTab = () => {
    if (activeTab === "friend") return friendListState;
    if (activeTab === "request") return requestListState;
    if (activeTab === "invite") return inviteListState;
    return [];
  };

  // 초대 버튼 클릭 시 대기중 상태 토글
  const handleInvite = (name) => {
    if (pendingInvites.includes(name)) {
      setPendingInvites(pendingInvites.filter(n => n !== name))
    } else {
      setPendingInvites([...pendingInvites, name]);
    }
  };

  // 삭제 / 수락 / 거절 클릭 시 해당 리스트에서 항목 제거
  const handleRemove = (name) => {
    if (activeTab === "friend") {
      setFriendListState(friendListState.filter(n => n !== name));
    } else if (activeTab === "request") {
      setRequestListState(requestListState.filter(n => n !== name));
    } else if (activeTab === "invite") {
      setInviteListState(inviteListState.filter(n => n !== name));
    }
  };

  return (
    <div className="invite-modal" ref={modalRef}>
      {/* 상단 고정 영역: 닫기 버튼, 검색창, 친구 추가 버튼, 탭 버튼 */}
      <div className="invite-modal-header">
        <div className="modal-top-row">
          <div className="modal-close" onClick={onClose}>x</div>
          <div className="invite-search-bar">
            <input type="text" placeholder="닉네임 검색" />
            <img src={search2} alt="Search" />
          </div>
          <button onClick={onAddFriendClick} className="invite-add-btn">+ 친구 추가</button>
        </div>

        <div className="invite-tab-buttons">
          <button
            className={activeTab === "friend" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("friend")}
          >
            친구 목록
          </button>
          <button
            className={activeTab === "request" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("request")}
          >
            요청 목록
          </button>
          <button
            className={activeTab === "invite" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("invite")}
          >
            초대 목록
          </button>
        </div>
      </div>

      {/* 리스트 출력 영역: 탭에 따른 친구 목록 */}
      <div className="invite-modal-scroll">
        {getListByTab().map((name, index) => (
          <div key={index}>
            <div className="friend-item">
              <div className="rectangle" />
              <div className="user-name">{name}</div>
              <div className="button-group">
                {/* 친구 목록 탭: 초대/철회 + 삭제 */}
                {activeTab === "friend" && (
                  <>
                    {pendingInvites.includes(name) ? (
                      <div className="frame pending" onClick={() => handleInvite(name)}>대기중</div>
                    ) : (
                      <div className="frame" onClick={() => handleInvite(name)}>초대</div>
                    )}
                    <div className="frame danger" onClick={() => handleRemove(name)}>삭제</div>
                  </>
                )}
                {/* 요청/초대 탭: 수락 + 거절 */}
                {(activeTab === "request" || activeTab === "invite") && (
                  <>
                    <div className="frame" onClick={() => handleRemove(name)}>수락</div>
                    <div className="frame danger" onClick={() => handleRemove(name)}>거절</div>
                  </>
                )}
              </div>
            </div>
            {index !== getListByTab().length - 1 && (
              <div className="gray-line" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteModal;
