import React, { useState } from "react";
import "./SetNickname.css";
import loginLogo from "../../assets/images/login_logo.svg";
import checkIcon from "../../assets/images/check.svg";
import denyIcon from "../../assets/images/deny.svg";


const SetNickname = () => {
    const [nickname, setNickname] = useState("");
    const [nicknameStatus, setNicknameStatus] = useState("available");
  
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
            }}
            placeholder="닉네임 입력"
          />
          <button
            onClick={() => {
                // (임시) 테스트용 더미 로직
                if (nickname.length < 3 || nickname.length > 20) {
                setNicknameStatus("invalid");
                } else if (nickname === "takenid123") {
                setNicknameStatus("taken");
                } else {
                setNicknameStatus("available");
                }
            }}
            >
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
        </div>
  
        <button className="nickname-submit-button" onClick={() => {}}>
          닉네임 설정
        </button>
      </div>
    );
  };
  
  export default SetNickname;