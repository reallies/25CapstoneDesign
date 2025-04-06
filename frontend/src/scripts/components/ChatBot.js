import React, { useState } from "react";
import chatbotIcon from "../../assets/images/chatbot.svg";
import icon from "../../assets/images/icon.svg";
import "./ChatBot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);

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
              <p>반갑습니다! 쉽고 빠른 여행 플랜,<br /><strong>slay support</strong>와 함께해요.</p>
              <p>어디로 떠날지 고민되시나요?<br />AI 추천부터 일정 정리까지 도와드릴게요.</p>
              <p>✈️ 당신의 여행, 어디부터 도와드릴까요?</p>
            </div>
            <div className="chatbot-buttons">
              {[
                "AI 일정 생성 어떻게 해?",
                "여행 꿀팁 알려줘",
                "웹 사용법 알려줘",
                "slay support가 뭐야?",
                "인기 여행지 추천해줘",
              ].map((text, idx) => (
                <button key={idx} className="chatbot-quick-btn">{text}</button>
              ))}
            </div>
            <div className="chatbot-input-box">
              <input type="text" placeholder="support에게 물어보세요" />
              <button className="chatbot-send-btn">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;