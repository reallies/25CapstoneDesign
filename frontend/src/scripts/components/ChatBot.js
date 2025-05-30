import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import chatbotIcon from "../../assets/images/chatbot.svg";
import icon from "../../assets/images/icon.svg";
import searchIcon from "../../assets/images/search1.svg";
import "./ChatBot.css";

// Axios 기본 설정
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true,
});

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placeSearchMode, setPlaceSearchMode] = useState(false);
  const [showQuickButtons, setShowQuickButtons] = useState(true);

  const messageListRef = useRef(null); // 메시지 목록 참조

  // 대화 기록 및 토글 상태 복원
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    const storedToggleState = localStorage.getItem("showQuickButtons");
    if (storedToggleState !== null) {
      setShowQuickButtons(JSON.parse(storedToggleState));
    }
  }, []);

  // 대화 기록 저장
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // 토글 상태 저장
  useEffect(() => {
    localStorage.setItem("showQuickButtons", JSON.stringify(showQuickButtons));
  }, [showQuickButtons]);

  // 모달 열릴 때 스크롤 위치 복원
  useEffect(() => {
    if (open && messageListRef.current) {
      const savedScrollPosition = localStorage.getItem("modalScrollPosition");
      if (savedScrollPosition) {
        messageListRef.current.scrollTop = parseInt(savedScrollPosition, 10);
      }
    }
  }, [open]);

  // 메시지가 업데이트될 때 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 메시지 전송
  const handleSendMessage = async (overrideInput) => {
    const messageToSend = overrideInput ?? input;
    if (!messageToSend.trim()) return;

    setIsLoading(true);
    const newUserMessage = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    try {
      const endpoint = placeSearchMode ? "/chatbot/search-places" : "/chatbot/travel-info";
      const response = await api.post(endpoint, { input: messageToSend });

      const assistantMessage = placeSearchMode
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
      setPlaceSearchMode(false);
    }
  };

  // 빠른 질문 버튼 클릭 시 메시지 전송 및 토글
  const handleQuickButton = async (text) => {
    await handleSendMessage(text);
    setShowQuickButtons(false); // 빠른 질문 버튼 목록 숨김
  };

  // 세션 초기화
  const handleResetSession = async () => {
    try {
      await api.post("/chatbot/reset-session");
      setMessages([]);
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("modalScrollPosition");
      localStorage.removeItem("showQuickButtons"); // 토글 상태 초기화
      setShowQuickButtons(true); // 초기 상태로 설정
    } catch (error) {
      console.error("세션 초기화 실패:", error);
    }
  };

  // 모달 토글 및 스크롤 위치 저장
  const toggleChatBot = () => {
    if (open && messageListRef.current) {
      localStorage.setItem("modalScrollPosition", messageListRef.current.scrollTop);
    }
    setOpen((prev) => !prev);
  };

  // 빠른 질문 토글
  const toggleQuickButtons = () => {
    setShowQuickButtons((prev) => !prev);
  };

  return (
    <div>
      <div className="floating-button" onClick={toggleChatBot}>
        <img src={chatbotIcon} alt="chatbot" />
      </div>
      {open && (
        <div className="chatbot-overlay" onClick={toggleChatBot}>
          <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-ui">
              <div className="chatbot-header">
                <div className="chatbot-profile">
                  <img src={icon} alt="profile" />
                </div>
                <div className="chatbot-title">slay support</div>
              </div>

              <div className="chatbot-message-area" ref={messageListRef} style={{ maxHeight: "400px", overflowY: "auto" }}>
                <div className="chatbot-message">
                  <p>반갑습니다! 쉽고 빠른 여행 플랜,<br /><strong>slay support</strong>와 함께해요.</p>
                  <p>어디로 떠날지 고민되시나요?<br />AI 추천부터 일정 정리까지 도와드릴게요.</p>
                  <p>✈️ 당신의 여행, 어디부터 도와드릴까요?</p>
                </div>

                {messages.map((msg, idx) => {
                  if (msg.role === "user") {
                    return (
                      <React.Fragment key={idx}>
                        <div className="chatbot-user-wrapper">
                          <div className="chatbot-user-message">
                            <p>{msg.content}</p>
                          </div>
                        </div>

                        {messages[idx + 1]?.role === "assistant" && (
                          <div className="chatbot-message">
                            {messages[idx + 1].content.split("<br />").map((line, lineIdx) => (
                              <p key={lineIdx} dangerouslySetInnerHTML={{ __html: line }} />
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }
                  return null;
                })}

                {isLoading && (
                  <div className="chatbot-message">
                    <div className="skeleton-line" style={{ width: "70%" }} />
                    <div className="skeleton-line" style={{ width: "50%" }} />
                  </div>
                )}
              </div>

              <div className="chatbot-buttons-wrapper">
                <button className="toggle-button" onClick={toggleQuickButtons} style={{ color: "#d1d1d1" }}>
                  {showQuickButtons ? "⬇" : "⬆"}
                </button>
                {showQuickButtons && (
                  <div className="chatbot-buttons">
                    {[
                      "AI 일정 생성 어떻게 해?",
                      "여행 꿀팁 알려줘",
                      "웹 사용법 알려줘",
                      "slay support가 뭐야?",
                      "인기 여행지 추천해요",
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
                )}
              </div>

              <div className="chatbot-input-box">
                <button
                  className={`chatbot-search-btn ${placeSearchMode ? "active" : ""}`}
                  onClick={() => setPlaceSearchMode(!placeSearchMode)}
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
        </div>
      )}
    </div>
  );
};

export default ChatBot;