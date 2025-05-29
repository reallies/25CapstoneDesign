import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./NavigationBar.css";

import logo from "../../assets/images/logo.svg";
import defaultUser from "../../assets/images/user.svg";
import global from "../../assets/images/global.svg";
import search2 from "../../assets/images/search2.svg";
import LoginModal from "../components/LoginModal";
import {AlertModal} from "../components/AlertModal";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const alertShownRef = useRef(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      setIsProfileOpen(prev => !prev); // 로그인 상태면 모달 토글
    }
  };

  const handleLatestTrip = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/schedule/recent`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success && data.trip_id) {
        navigate(`/schedule/${data.trip_id}`);
      } else {

        if (!alertShownRef.current) {
          alertShownRef.current = true;
          setAlertText("최근 생성된 여행 일정이 없습니다.");
          setAlertOpen(true);
          setTimeout(() => {
            alertShownRef.current = false;
          }, 1000);
        }

      }
    }
    catch (error) {
      console.error("최근 여행 불러오기 실패", error);
    }
  };

  return (
    <div className="navbar">
      {/* 로고 */}
      <div style={{ width: "200px", height: "auto" }}>
        <img className="nav-logo" src={logo} alt="logo" style={{ width: "80%", height: "auto" }} />
      </div>

      {/* 네비게이션 메뉴 */}
      <div className="nav-menu">
        <span onClick={() => navigate("/")}>홈</span>
        <span onClick={handleLatestTrip}>여행 일정</span>
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
          disabled />
        <img src={search2} alt="search2" />
      </div>

      {/* 프로필 및 다국어 지원 */}
      <div className="nav-icons">
        <img src={isLoggedIn && user?.image_url && !user?.nickname?.startsWith("temp_") ? user.image_url : defaultUser} alt="profile" onClick={handleProfileClick} style={{ width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" }} />
        <img src={global} alt="global" />
      </div>
      {isLoggedIn && (
        <LoginModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      )}
      {alertOpen && (
        <AlertModal text={alertText} onClose={() => setAlertOpen(false)} />
      )}
    </div>

  );
};

export default NavigationBar;