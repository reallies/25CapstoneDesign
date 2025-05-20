import React, { useState, useEffect } from "react";
import axios from "axios";
import chatbotIcon from "../../assets/images/chatbot.svg";
import icon from "../../assets/images/icon.svg";
import searchIcon from "../../assets/images/search1.svg";
import "./ChatBot.css";

// Axios 기본 설정
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "반갑습니다! 쉽고 빠른 여행 플랜, <strong>slay support</strong>와 함께해요.<br />어디로 떠날지 고민되시나요? AI 추천부터 일정 정리까지 도와드릴게요.<br />✈️ 당신의 여행, 어디부터 도와드릴까요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 세션 초기화
  useEffect(() => {
    const resetSession = async () => {
      try {
        await api.post("/chatbot/reset-session");
        console.log("세션 초기화 완료");
      } catch (error) {
        console.error("세션 초기화 실패:", error);
      }
    };
    resetSession();
  }, []);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const isPlaceSearch = input.includes("장소") || input.includes("검색");
      const endpoint = isPlaceSearch ? "/chatbot/search-places" : "/chatbot/travel-info";
      const response = await api.post(endpoint, { input });

      const assistantMessage = isPlaceSearch
        ? {
            role: "assistant",
            content: `검색된 장소:<br />${response.data.places
              .map((place) => `${place.place_name} (${place.address_name})`)
              .join("<br />")}`,
          }
        : { role: "assistant", content: response.data.travelInfo };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 빠른 질문 버튼
  const handleQuickButton = (text) => {
    setInput(text);
    handleSendMessage();
  };

  // 장소 검색
  const handleSearchPlaces = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const response = await api.post("/chatbot/search-places", { input });
      const assistantMessage = {
        role: "assistant",
        content: `검색된 장소:<br />${response.data.places
          .map((place) => `${place.place_name} (${place.address_name})`)
          .join("<br />")}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("장소 검색 실패:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "장소 검색에 실패했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 초기화
  const handleResetSession = async () => {
    try {
      await api.post("/chatbot/reset-session");
      setMessages([
        {
          role: "assistant",
          content:
            "반갑습니다! 쉽고 빠른 여행 플랜, <strong>slay support</strong>와 함께해요.<br />어디로 떠날지 고민되시나요? AI 추천부터 일정 정리까지 도와드릴게요.<br />✈️ 당신의 여행, 어디부터 도와드릴까요?",
        },
      ]);
    } catch (error) {
      console.error("세션 초기화 실패:", error);
    }
  };

  // 모달 토글
  const toggleChatBot = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div>
      <div className="floating-button" onClick={toggleChatBot}>
        <img src={chatbotIcon} alt="chatbot" />
      </div>
      {open && (
        <div className="chatbot-modal" onClick={toggleChatBot}>
          <div className="chatbot-ui" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-header">
              <div className="chatbot-profile">
                <img src={icon} alt="profile" />
              </div>
              <div className="chatbot-title">slay support</div>
              <div className="chatbot-time">PM 01:08</div>
            </div>
            <div className="chatbot-message">
              {messages.map((msg, idx) => (
                <p
                  key={idx}
                  className={msg.role === "user" ? "user-message" : "assistant-message"}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              ))}
              {isLoading && <p>처리 중...</p>}
            </div>
            <div className="chatbot-buttons">
              {[
                "AI 일정 생성 어떻게 해?",
                "여행 꿀팁 알려줘",
                "웹 사용법 알려줘",
                "slay support가 뭐야?",
                "인기 여행지 추천해줘",
              ].map((text, idx) => (
                <button
                  key={idx}
                  className="chatbot-quick-btn"
                  onClick={() => handleQuickButton(text)}
                  disabled={isLoading}
                >
                  {text}
                </button>
              ))}
              <button
                className="chatbot-quick-btn"
                onClick={handleResetSession}
                disabled={isLoading}
              >
                대화 초기화
              </button>
            </div>
            <div className="chatbot-input-box">
              <button
                className="chatbot-search-btn"
                onClick={handleSearchPlaces}
                disabled={isLoading}
              >
                <img src={searchIcon} alt="search" />
                <span>장소검색</span>
              </button>
              <input
                type="text"
                placeholder="support에게 물어보세요"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <button
                className="chatbot-send-btn"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;