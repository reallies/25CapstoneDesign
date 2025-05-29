import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import "./InviteModal.css";
import search2 from "../../assets/images/search2.svg";
import {AlertModal} from "./AlertModal";

// Axios 기본 설정
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true,
});

const InviteModal = ({ onClose, modalRef, tripId, position ={} }) => {
  const [activeTab, setActiveTab] = useState("friend");
  const [friendListState, setFriendListState] = useState([]);
  const [requestListState, setRequestListState] = useState([]);
  const [inviteListState, setInviteListState] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingAdds, setPendingAdds] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //알람창
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("warn"); // success / error
  const alertShownRef = useRef(false);

  const showAlert = (message, type = "error", duration = 1500) => {
    if (alertShownRef.current) return;

    alertShownRef.current = true;
    setAlertText(message);
    setAlertType(type);
    setAlertOpen(true);

    setTimeout(() => {
      alertOpen && setAlertOpen(false);
      alertShownRef.current = false;
    }, duration);
  };

  const modalStyle ={
    position: "absolute",
    top:position.top,
    left: position.left,
    zIndex: 1000,
  }

  const fetchFriendList = async () => {
    try {
      const response = await api.get("/friendship/list");
      setFriendListState(response.data.friends || []);
    } catch (error) {
      console.error("친구 목록 조회 실패:", error);
    }
  };
  
  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/friendship/pending");
      setRequestListState(response.data.pendingRequests || []);
    } catch (error) {
      console.error("요청 목록 조회 실패:", error);
    }
  };
  
  const fetchPendingInvites = async () => {
    try {
      const response = await api.get("/trip/invite/pending");
      setInviteListState(response.data.pendingInvitations || []);
    } catch (error) {
      console.error("초대 목록 조회 실패:", error.response ? error.response.data : error.message);
      setInviteListState([]);
    }
  };
 
  //초대된 사용자 찾기
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [acceptedUserIds, setAcceptedUserIds] = useState([]);
  const fetchInvitedUsers = async () => {
    try {
      const res = await api.get(`/trip/${tripId}/invited`);
      setInvitedUserIds(res.data.pending || []);
      setAcceptedUserIds(res.data.accepted || []);
    } catch (err) {
      console.error("초대 상태 조회 실패:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "friend") {
      fetchFriendList();
      if (tripId) {
        fetchInvitedUsers();
      }
    } else if (activeTab === "request") {
      fetchPendingRequests();
    } else if (activeTab === "invite") {
      fetchPendingInvites();
    }
  }, [activeTab, tripId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return showAlert("닉네임을 입력해주세요.", "warn");
    
    setIsLoading(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
      const response = await api.get(`/friendship/search?nickname=${searchTerm}`);
      setSearchResults(response.data.users || []);

      const filtered = response.data.users.filter(user =>
        user.nickname.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);

      if (response.data.users.length === 0) setSearchResults([]);
    } catch (err) {
      console.error("검색 실패:", err);
      setSearchResults([]);
      showAlert("검색에 실패했습니다.", "warn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (nickname) => {
    try {
      await api.post("/friendship/request", { recipient_nickname: nickname });
      setPendingAdds((prev) => [...prev, nickname]);
      showAlert("친구 요청을 보냈습니다.", "success");
    } catch (err) {
      console.error("친구 요청 실패:", err);
      alert(err.response?.data?.message || "요청에 실패했습니다.");
    }
  };

  // 초대 기능
  const handleInvite = async (friend) => {
    if (!tripId) {
      console.error("tripId가 정의되지 않았습니다.");
      showAlert("여행 ID가 누락되었습니다. 올바른 여행을 선택해주세요.", "warn");
      return;
    }

    try {
      await api.post("/trip/invite", {
        trip_id: tripId,
        invited_nickname: friend.nickname,
      });
      await fetchInvitedUsers();
      
      setPendingInvites([...pendingInvites, friend.user_id]);
      showAlert("초대가 성공적으로 전송되었습니다!", "success");
    } catch (error) {
      console.error("초대 전송 실패:", error.response ? error.response.data : error.message);
    }
  };

  // 요청 수락 기능
  const handleAccept = async (friendshipId) => {
    try {
      await api.put("/friendship/accept", { friendship_id: friendshipId });
      setRequestListState(requestListState.filter((req) => req.friendship_id !== friendshipId));
      showAlert("친구 요청이 수락되었습니다!", "success");
    } catch (error) {
      console.error("요청 수락 실패:", error);
      alert(error.response?.data?.message || "요청 수락에 실패했습니다.");
    }
  };

  // 요청 거절 기능
  const handleReject = async (friendshipId) => {
    try {
      await api.put("/friendship/reject", { friendship_id: friendshipId });
      setRequestListState(requestListState.filter((req) => req.friendship_id !== friendshipId));
      showAlert("친구 요청이 거절되었습니다.", "success");
    } catch (error) {
      console.error("요청 거절 실패:", error);
      alert(error.response?.data?.message || "요청 거절에 실패했습니다.");
    }
  };

  // 초대 수락 기능
  const handleAcceptInvite = async (invitationId) => {
    try {
      await api.put("/trip/invite/accept", { invitation_id: invitationId });
      setInviteListState(inviteListState.filter((inv) => inv.invitation_id !== invitationId));
      fetchFriendList();
      showAlert("초대가 수락되었습니다!", "success");
    } catch (error) {
      console.error("초대 수락 실패:", error);
      alert(error.response?.data?.message || "초대 수락에 실패했습니다.");
    }
  };

  // 초대 거절 기능
  const handleRejectInvite = async (invitationId) => {
    try {
      await api.put("/trip/invite/reject", { invitation_id: invitationId });
      setInviteListState(inviteListState.filter((inv) => inv.invitation_id !== invitationId));
      showAlert("초대가 거절되었습니다.", "success");
    } catch (error) {
      console.error("초대 거절 실패:", error);
      alert(error.response?.data?.message || "초대 거절에 실패했습니다.");
    }
  };

  // 현재 탭에 따라 출력할 리스트 반환
  const getListByTab = () => {
    if (activeTab === "friend") {
      return friendListState.map((friend, index) => (
        <div key={index}>
          <div className="friend-item">
            <img src={friend.image_url} className="rectangle"/>
            <div className="user-name">{friend.nickname}</div>
            <div className="button-group">
              {tripId && (
                acceptedUserIds.includes(friend.user_id) ? (
                  <div className="frame already">초대됨</div>
                ) : invitedUserIds.includes(friend.user_id) ? (
                  <div className="frame pending">대기중</div>
                ) : (
                  <div className="frame" onClick={() => handleInvite(friend)}>초대</div>
                )
              )}

              <div className="frame danger" onClick={() => showAlert("친구 삭제 기능은 준비 중입니다.", "warn")}>삭제</div>
            </div>
          </div>
          {index !== friendListState.length - 1 && <div className="gray-line" />}
        </div>
      ));
    } else if (activeTab === "request") {
      return requestListState.map((req, index) => (
        <div key={index}>
          <div className="friend-item">
            <img src={req.requester_image_url} className="rectangle"/>
            <div className="user-name">{req.requester_nickname}</div>
            <div className="button-group">
              <div className="frame" onClick={() => handleAccept(req.friendship_id)}>수락</div>
              <div className="frame danger" onClick={() => handleReject(req.friendship_id)}>거절</div>
            </div>
          </div>
          {index !== requestListState.length - 1 && <div className="gray-line" />}
        </div>
      ));
    } else if (activeTab === "invite") {
      return inviteListState.length > 0 ? (
        inviteListState.map((inv, index) => (
          <div key={index}>
            <div className="friend-item">
              <img src={inv.inviter_image_url} className="rectangle"/>
              <div className="user-name">{inv.inviter_nickname}</div>
              <div className="slash"> - </div>
              <div className="trip-name">{inv.trip_title}</div>
              <div className="button-group">
                <div className="frame" onClick={() => handleAcceptInvite(inv.invitation_id)}>수락</div>
                <div className="frame danger" onClick={() => handleRejectInvite(inv.invitation_id)}>거절</div>
              </div>
            </div>
            {index !== inviteListState.length - 1 && <div className="gray-line" />}
          </div>
        ))
      ) : (
        <div className="friend-item">받은 초대가 없습니다.</div>
      );
    } else if(activeTab === "add"){
      return(
        <div className="add-friend-section">
          <div className="invite-search-bar">
            <input
              type="text"
              placeholder="닉네임 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <img src={search2} alt="검색" onClick={handleSearch} />
          </div>

          {searchResults.length === 0 &&  !isLoading && hasSearched && (
            <div className="text-wrapper-2">검색 결과가 없습니다.</div>
          )}

          {hasSearched &&  !isLoading && searchResults.length > 0 && (
            searchResults.map((user, index) => (
              <div className="friend-item" key={index}>
                <img src={user.image_url} className="rectangle"/>
                <div className="user-name">{user.nickname}</div>
                <div className="button-group">
                  {pendingAdds.includes(user.nickname) ? (
                    <div className="frame pending">대기중</div>
                  ) : (
                    <div className="frame" onClick={() => handleAddFriend(user.nickname)}>추가</div>
                  )}
                </div>
              </div>
            )))}
        </div>
      );
    }

    return [];
  };

  return (
    <div className="invite-modal" ref={modalRef} style={modalStyle}>
      {/* 상단 고정 영역: 닫기 버튼, 검색창, 친구 추가 버튼, 탭 버튼 */}
      <div className="invite-modal-header">
        <div className="modal-top-row">
          <div className="modal-close" onClick={onClose}>x</div>

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
          <button 
            className={"invite-add-btn"}
            onClick={() => setActiveTab("add")} 
          >
            + 친구 추가
          </button>
        </div>

      </div>

      {/* 리스트 출력 영역: 탭에 따른 친구 목록 */}
      <div className="invite-modal-scroll">{getListByTab()}</div>

      {alertOpen && (
        <AlertModal text={alertText} type={alertType} onClose={() => setAlertOpen(false)} />
      )}

    </div>
  );
};

export default InviteModal;