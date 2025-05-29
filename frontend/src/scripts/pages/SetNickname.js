import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./SetNickname.css";
import loginLogo from "../../assets/images/login_logo.svg";
import checkIcon from "../../assets/images/check.svg";
import denyIcon from "../../assets/images/deny.svg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 

const SetNickname = () => {
    const [nickname, setNickname] = useState("");
    const [nicknameStatus, setNicknameStatus] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 관리
    const navigate = useNavigate(); // 프로그래매틱 네비게이션

    const { checkLoginStatus } = useContext(AuthContext);

    // 페이지 이탈 경고 설정
    useEffect(() => {
      const handleBeforeUnload = (e) => {
        if (nickname && !isSubmitting) {
          e.preventDefault();
          e.returnValue = "닉네임 설정을 완료하지 않았습니다. 정말 나가시겠습니까?";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [nickname, isSubmitting]);


  //닉네임 중복,형식 검사
  const handleCheckNickname = async () => {
    const trimmed = nickname.trim();
    setError("");

    if (!/^[a-z0-9]{3,15}$/.test(trimmed)) {
      setNicknameStatus("invalid");
      return;
    }
  
    try {
      // 2. 중복 검사 (백엔드)
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/check-nickname`, 
        { nickname: trimmed }, 
        { withCredentials: true }
      );
  
      setNicknameStatus(res.data.available ? "available" : "taken");
    } catch (err) {
      console.error("중복 검사 에러:", err);
      setNicknameStatus("error");
    }
  };

  //닉네임 설정하기 버튼
  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    
    if (nicknameStatus !== "available") {
      setError("먼저 닉네임 중복 확인을 해주세요.");
      return;
    }
  
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/set-nickname`, 
        { nickname: trimmed },
        { withCredentials: true }
      );
  
      await checkLoginStatus(); // 유저 아이디 최신 반영
      navigate("/");
    } catch (err) {
      setError("닉네임 설정 중 오류가 발생했습니다.");
    }
  };


    return (
      <div className="nickname-wrapper">
        <img src={loginLogo} alt="SLAY 로고" className="nickname-logo" />
  
        <h2 className="nickname-title">SLAY에 오신 것을 환영합니다!</h2>
        <p className="nickname-sub">사용하실 닉네임을 입력하세요</p>
  
        <div className="nickname-input-box">
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameStatus(""); 
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCheckNickname();
              }
            }}
            placeholder="닉네임 입력"
            disabled={isSubmitting}
          />
          <button onClick={ handleCheckNickname} disabled={isSubmitting} >
            확인
          </button>
        </div>
        
        {/* (임시) 닉네임 체크 문구 테스트용 */}
        <div className="nickname-check-message">
            {nicknameStatus === "available" && (
                <>
                <img src={checkIcon} alt="check" className="check-icon" />
                <span style={{ color: "#4ACD9F" }}>사용 가능한 닉네임입니다.</span>
                </>
            )}
            {nicknameStatus === "taken" && (
                <>
                <img src={denyIcon} alt="deny" className="check-icon" />
                <span style={{ color: "#FF5353" }}>이미 사용 중인 닉네임입니다.</span>
                </>
            )}
            {nicknameStatus === "invalid" && (
                <>
                <img src={denyIcon} alt="deny" className="check-icon" />
                <span style={{ color: "#FF5353" }}>
                    닉네임은 3~20자의 영어 소문자/숫자만 가능합니다.
                </span>
                </>
            )}
            {error && (
              <>
                <img src={denyIcon} alt="error" className="check-icon" />
                <span style={{ color: "#FF5353" }}>{error}</span>
              </>
            )}
        </div>
  
        <button className="nickname-submit-button" onClick={handleSubmit} disabled={isSubmitting || nicknameStatus !== "available"}>
          닉네임 설정
        </button>
      </div>
    );
  };
  
  export default SetNickname;