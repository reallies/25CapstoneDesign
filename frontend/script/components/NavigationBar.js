import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

import logo from "../../assets/images/logo.svg";
import user from "../../assets/images/user.svg";
import global from "../../assets/images/global.svg";
import search2 from "../../assets/images/search2.svg";

const NavigationBar = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="navbar">
      {/* 로고 */}
      <img className="nav-logo" src={logo} alt="logo" />
      <div style={{ position: "absolute", left: 66, top: 32 }}>
      <span style={{ color: 'black', fontSize: 20, fontFamily: 'SUITE', fontWeight: 800, textTransform: 'uppercase', lineHeight: '24px', letterSpacing: 0.5, paddingLeft: 5 }}>
            TRAVEL
          </span>
          <span style={{ color: 'black', fontSize: 20, fontFamily: 'SUITE', fontWeight: 400, textTransform: 'uppercase', lineHeight: '24px', letterSpacing: 0.5 }}>
            {' '}
          </span>
          <span style={{ color: 'black', fontSize: 14, fontFamily: 'SUITE', fontWeight: 400, textTransform: 'uppercase', lineHeight: '24px', letterSpacing: 0.5 }}>
            PLANNER
          </span>
      </div>

      {/* 네비게이션 메뉴 */}
      <div className="nav-menu">
        <span onClick={() => navigate("/")}>홈</span>
        <span>여행 일정</span>
        <span>커뮤니티</span>
        <span>내 기록</span>
      </div>

      {/* 검색창 */}
      <div className="search-container">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={isFocused ? "" : "어디로 떠나실 계획인가요?"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (searchText === "") setIsFocused(false);
          }}
        />
        <img src={search2} alt="search2" />
      </div>

      {/* 프로필 및 다국어 지원 */}
      <div className="nav-icons">
        <img src={user} alt="profile" onClick={() => navigate("/login")} />
        <img src={global} alt="global" />
      </div>
    </div>
  );
};

export default NavigationBar;