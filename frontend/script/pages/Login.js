import React from "react";
import "./Login.css";

import logo from "../../assets/images/logo.svg";
import google from "../../assets/images/google.svg";
import kakao from "../../assets/images/kakao.svg";
import naver from "../../assets/images/naver.svg";

const Login = () => {
  return (
    <div className="login-container">
      {/* 로고 및 타이틀 */}
      <div className="login-header">
        <img className="login-logo" src={logo} alt="logo" />
        <h1>
        <span className="bold">TRAVEL</span>
        <span className="small"> PLANNER</span>
        </h1>
      </div>

      <div className="login-description">
        <p>쉽고 빠르게 완성하는 나만의 여행 플랜</p>
        <p>AI 추천과 스마트 일정 관리, 한 번에 해결하세요!</p>
      </div>

      {/* 로그인 버튼 */}
      <div className="login-buttons">
        <div className="login-button google">
          <img src={google} alt="Google" />
          Google로 시작하기
        </div>
        <div className="login-button kakao">
          <img src={kakao} alt="Kakao" />
          Kakao로 시작하기
        </div>
        <div className="login-button naver">
          <img src={naver} alt="Naver" />
          Naver로 시작하기
        </div>
      </div>
    </div>
  );
};

export default Login;