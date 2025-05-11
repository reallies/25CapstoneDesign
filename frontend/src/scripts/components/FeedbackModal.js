import React from "react";
import "./FeedbackModal.css";
import icon from "../../assets/images/icon.svg";

// 지도 대신 화면 오른쪽에 피드백 내용을 띄움
const FeedbackModal = ({ onClose }) => {
  return (
    // 모달 전체 영역 (바깥 클릭 시 onClose 실행)
    <div className="feedback-modal" onClick={onClose}>
      {/* 모달 내부 영역 (바깥 클릭 방지) */}
      <div className="feedback-box" onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 상단 - 프로필 사진, 제목, 시간 표시 */}
        <div className="feedback-header">
          <img src={icon} alt="profile" className="feedback-profile" />
          <div className="feedback-title">slay support</div>
          <div className="feedback-time">PM 01:08</div>
        </div>

        {/* 일정 점검 완료 메시지 */}
        <div className="feedback-message">
          <p className="check-title">✨ 일정 체크 완료!</p>
          <p className="check-desc">
            여행 일정, 한 번 더 꼼꼼히 확인해드릴게요!<br />
            <strong>slay support</strong>가 당신의 계획을 똑똑하게 점검해드립니다!
          </p>
        </div>

        {/* 1번째 피드백 - 이동 동선 개선 제안 */}
        <div className="feedback-bubble">
          <p className="bubble-label">💬 더 효율적인 동선을 추천해드려요!</p>
          <p><strong>DAY 2</strong>의 전주 수목원 &gt; 레일바이크 &gt; 호텔 이동 경로 왕복 이동이 깁니다.</p>
          <p className="bubble-highlight">레일바이크를 DAY 1에 넣는 건 어떨까요?</p>
          <button className="feedback-btn black">추천 순서로 재정렬하기</button>
        </div>

        {/* 2번째 피드백 - 맛집 브레이크 타임 주의 */}
        <div className="feedback-bubble">
          <p className="bubble-label">💬 DAY 3일 '○○맛집'은 브레이크 타임이 있어요.</p>
          <p>・운영시간: 11:00~22:00 / 브레이크: 15:00~16:00</p>
          <p className="bubble-highlight">현재 일정상 15:30 방문은 어려워요.</p>
          <div className="feedback-btns">
            <button className="feedback-btn black">다른 시간 추천받기</button>
            <button className="feedback-btn black">주변 식당 추천받기</button>
          </div>
        </div>

        {/* 3번째 피드백 - 비 예보로 실내 활동 제안 */}
        <div className="feedback-bubble">
          <p className="bubble-label">💬 야외 활동이 예정된 날, 비 소식이 있어요!</p>
          <p>
            <strong>DAY 3</strong> 오후에 전주 중앙공원 일정이 있지만,<br />
            비 예보가 있어요 ☔️
          </p>
          <p className="bubble-highlight">실내 일정으로 바꿔볼까요?</p>
          <button className="feedback-btn black">대체 일정 추천받기</button>
        </div>
        
      </div>
    </div>
  );
};

export default FeedbackModal;