import React, { useContext } from "react";
import "./MyPage.css";
import userIcon from "../../assets/images/user.svg";
import cogwheelIcon from "../../assets/images/cogwheel.svg";
import { AuthContext } from "../context/AuthContext";

const MyPage = () => {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // 새로고침 or 상태 초기화 필요
    window.location.href = "/";
  };

  return (
    <div className="mypage-container">
      <div className="mypage-box">
        <div className="profile-section">
          <div className="profile-image-wrapper">
            <img src={userIcon} alt="user" className="user-icon" />
            <img src={cogwheelIcon} alt="settings" className="cogwheel-icon" />
          </div>
          <div className="info-section">
            <label className="info-label">닉네임</label>
            <div className="nickname-box">
              <input
                type="text"
                value={user?.nickname || ""}
                readOnly
              />
              <button className="change-button">변경</button>
            </div>

            <label className="info-label">로그인 유형</label>
            <input
              type="text"
              value={user?.provider || "" }
              className="account-input"
              readOnly
            />

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="logout-btn" onClick={handleLogout} style={{ marginTop: 0}}>로그아웃</button>
            </div>

            <div className="withdraw-text">회원 탈퇴</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
