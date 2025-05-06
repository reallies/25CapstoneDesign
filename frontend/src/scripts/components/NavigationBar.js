import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

import logo from "../../assets/images/logo.svg";
import user from "../../assets/images/user.svg";
import global from "../../assets/images/global.svg";
import search2 from "../../assets/images/search2.svg";
import LoginModal from "./LoginModal";

const NavigationBar = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="navbar">
      {/* 로고 */}
      <div style={{ width: "200px", cursor: "pointer" }} onClick={() => navigate("/")}>
        <img className="nav-logo" src={logo} alt="logo" style={{ width: "80%" }} />
      </div>

      {/* 메뉴 */}
      <div className="nav-menu">
        <span onClick={() => navigate("/")}>홈</span>
        <span onClick={() => navigate("/schedules")}>여행 일정</span>
        <span onClick={() => navigate("/gallery")}>여행 갤러리</span>
        <span onClick={() => navigate("/record")}>기록 쓰기</span>
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

      {/* 프로필 + 다국어 */}
      <div className="nav-icons">
        <img
          src={user}
          alt="profile"
          onClick={() => setIsModalOpen(true)} // (임시) 로그인 창 띄우지 X -> 로그인 모달만 열도록 설정(UI 확인용)
          style={{ cursor: "pointer" }}
        />
        <img src={global} alt="global" />
      </div>

      {/* (임시) 로그인 모달 띄우기용 */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default NavigationBar;