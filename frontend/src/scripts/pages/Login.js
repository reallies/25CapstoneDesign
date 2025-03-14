import React,{ useContext } from "react";
import "./Login.css";

import login_logo from "../../assets/images/login_logo.svg";
import google from "../../assets/images/google.svg";
import kakao from "../../assets/images/kakao.svg";
import naver from "../../assets/images/naver.svg";

const Login = () => {
  const handleLogin = (provider) => {
    window.location.href = `http://localhost:8080/auth/${provider}`;
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
    </div>
  );
};

export default Login;