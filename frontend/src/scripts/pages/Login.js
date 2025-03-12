import React, { useEffect, useState  } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import login_logo from "../../assets/images/login_logo.svg";
import google from "../../assets/images/google.svg";
import kakao from "../../assets/images/kakao.svg";
import naver from "../../assets/images/naver.svg";

const Login = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (provider) => {
    window.location.href = `http://localhost:8080/auth/${provider}`;
  };

  // 백엔드에서 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () =>{
      try {
        const res = await fetch("http://localhost:8080/profile", {
          method: "GET",
          credentials: "include",
      });
            if (res.status === 401) {
                setUser(null);
                return;
            }

            const data = await res.json();
            setUser(data);
          } catch (error) {
            console.error("사용자 정보 불러오기 실패:", error);
        }
    };
    fetchUserProfile();
}, []);

 //로그아웃
  const handleLogout = async () => {
    await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    setUser(null);
    navigate("/");
  };

  return (
    <div className="login-container">
      {/* 로고 및 타이틀 */}
      <div className="login-header">
        <img className="login-logo" src={login_logo} alt="logo" />
      </div>

      <div className="login-description">
        <p>쉽고 빠르게 완성하는 나만의 여행 플랜</p>
        <p>AI 추천과 스마트 일정 관리, 한 번에 해결하세요!</p>
      </div>

       {/* 로그인 상태 확인 */}
       {user ? (
        <div className="welcome-message">
        <h3>환영합니다, {user.nickname}님!</h3>
        <button className="logout-button" onClick={handleLogout}>로그아웃</button>
      </div>
      ) : (
        <div className="login-buttons">
          <div className="login-button google" onClick={() => handleLogin("google")}>
            <img src={google} alt="Google" />
            Google로 시작하기
          </div>
          <div className="login-button kakao" onClick={() => handleLogin("kakao")}>
            <img src={kakao} alt="Kakao" />
            Kakao로 시작하기
          </div>
          <div className="login-button naver" onClick={() => handleLogin("naver")}>
            <img src={naver} alt="Naver" />
            Naver로 시작하기
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;