import React, { useState } from "react";
import "./MyPage.css";
import userIcon from "../../assets/images/user.svg";
import cogwheelIcon from "../../assets/images/cogwheel.svg";

const MyPage = () => {
  const [nickname, setNickname] = useState("hansung");
  const [email, setEmail] = useState("hansung@naver.com");

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
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button className="change-button">변경</button>
            </div>

            <label className="info-label">계정</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="account-input"
            />

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="logout-button">로그아웃</button>
            </div>

            <div className="withdraw-text">회원 탈퇴</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
