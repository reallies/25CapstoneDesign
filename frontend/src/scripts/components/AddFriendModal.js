import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./AddFriendModal.css";
import search2 from "../../assets/images/search2.svg";

// AddFriendModal 컴포넌트: 친구 검색 및 요청 보내기
const AddFriendModal = ({ onClose, modalRef }) => {
  const { isLoggedIn, user } = useContext(AuthContext); // isLoggedIn과 user 가져오기
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const [pendingAdds, setPendingAdds] = useState([]); // 요청 대기중인 닉네임

  // 디버깅: AuthContext 상태 확인
  console.log("AddFriendModal 렌더링 - 로그인 상태:", isLoggedIn ? "로그인됨" : "로그인 안됨");
  console.log("현재 사용자:", user);

  // 친구 검색 처리: /friendship/search 호출
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      console.log("검색어 없음: 검색어가 비어 있습니다.");
      alert("검색어를 입력해주세요.");
      return;
    }
    if (!isLoggedIn) {
      console.log("로그인 안됨: AuthContext.isLoggedIn = false");
      console.log("사용자 정보:", user);
      alert("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      console.log("검색 시작: 검색어 =", searchTerm);
      console.log("요청 URL: http://localhost:8080/friendship/search");
      const response = await axios.get(`http://localhost:8080/friendship/search?nickname=${searchTerm}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // 쿠키 전송
      });
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      console.log("검색된 사용자:", response.data.users);

      setSearchResults(response.data.users || []);
      if (response.data.users.length === 0) {
        alert("검색된 사용자가 없습니다. 다른 닉네임을 시도해주세요.");
      }
    } catch (error) {
      console.error("사용자 검색 실패:", error);
      console.log("에러 상세:", {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "응답 없음",
      });
      alert("사용자 검색에 실패했습니다. 콘솔 로그를 확인해주세요.");
    }
  };

  // 친구 요청 보내기
  const handleAddFriend = async (nickname) => {
    if (!isLoggedIn) {
      console.log("로그인 안됨: 친구 요청 전 로그인 필요");
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      console.log("친구 요청 시작: 닉네임 =", nickname);
      const response = await axios.post(
        "http://localhost:8080/friendship/request",
        { recipient_nickname: nickname },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // 쿠키 전송
        }
      );
      console.log("친구 요청 응답:", response.data);
      setPendingAdds([...pendingAdds, nickname]);
      alert("친구 요청이 전송되었습니다!");
    } catch (error) {
      console.error("친구 요청 전송 실패:", error);
      console.log("에러 상세:", {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : "응답 없음",
      });
      alert(error.response?.data?.message || "친구 요청 전송에 실패했습니다.");
    }
  };

  return (
    <div className="add-friend-modal fixed-position" ref={modalRef}>
      <div className="modal-header">
        <div className="invite-search-bar">
          <input
            type="text"
            placeholder="닉네임 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <img src={search2} alt="Search" onClick={handleSearch} />
        </div>
      </div>
      <div className="text-wrapper-2">친구 추가</div>
      {searchResults.length === 0 && searchTerm && (
        <div className="text-wrapper-2">검색 결과가 없습니다.</div>
      )}
      {searchResults.map((user, index) => (
        <div key={index}>
          <div className="friend-item">
            <div className="rectangle" />
            <div className="user-name">{user.nickname}</div>
            <div className="button-group">
              {pendingAdds.includes(user.nickname) ? (
                <div className="frame pending">대기중</div>
              ) : (
                <div className="frame" onClick={() => handleAddFriend(user.nickname)}>
                  추가
                </div>
              )}
            </div>
          </div>
          {index !== searchResults.length - 1 && <div className="gray-line" />}
        </div>
      ))}
    </div>
  );
};

export default AddFriendModal;