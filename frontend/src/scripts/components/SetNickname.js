
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 훅 추가

const SetNickname = () => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 관리
  const navigate = useNavigate(); // 프로그래매틱 네비게이션

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력값이 비어 있는 경우
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(""); // 이전 오류 초기화

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/set-nickname",
        { nickname },
        { withCredentials: true }
      );

      if (response.data.message === "닉네임이 성공적으로 설정되었습니다.") {
        navigate("/"); // 성공 시 홈으로 이동
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "서버와의 연결에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>닉네임 설정</h2>
      <p>최초 로그인 시 닉네임을 설정해야 합니다.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="영어 소문자와 숫자 (3~15자)"
          disabled={isSubmitting} // 제출 중 입력 비활성화
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "설정 중..." : "설정"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        문제가 발생했나요? <a href="/" onClick={(e) => e.preventDefault() || navigate("/")}>홈으로 돌아가기</a>
      </p>
    </div>
  );
};

export default SetNickname;