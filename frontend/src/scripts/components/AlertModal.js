import React from "react";
import "./AlertModal.css";
import warningIcon from "../../assets/images/error.svg";
import successIcon from "../../assets/images/check.svg";
import deleteIcon from "../../assets/images/trash.svg";

// 경고 메시지를 띄우는 모달 컴포넌트
// props:
// - text: 표시할 경고 메시지 텍스트
// - onClose: 확인 버튼 클릭 시 실행할 함수
export const AlertModal = ({ text, onClose, type = "warn" }) => {
  const icon = type === "warn" ? warningIcon : successIcon ;

  return (
    // 모달 뒷배경 (클릭해도 닫히지 않도록 이벤트 전파 방지)
    <div className="alert-backdrop">
      {/* 모달 본문 영역 */}
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        {/* 경고 아이콘 */}
        <img src={icon} alt="경고" className="alert-icon" />

        {/* 경고 텍스트 */}
        <div className="alert-text">{text}</div>

        {/* 확인 버튼 */}
        <button className="alert-button" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

//삭제 알림창 모달
export const AlertDeleteModal = ({ text, onClose, onConfirm }) => {

  return (
    // 모달 뒷배경 (클릭해도 닫히지 않도록 이벤트 전파 방지)
    <div className="alert-backdrop">
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <img src={deleteIcon} alt="경고" className="alert-icon" />
        <div className="alert-text">{text}</div>
        
        <button className="alert-button" style={{marginRight:"20px", background:"#F36363"}} onClick={onConfirm}>
          삭제
        </button>
        <button className="alert-button" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};
