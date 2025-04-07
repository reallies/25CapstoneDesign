import "./InviteModal.css";
import search2 from "../../assets/images/search2.svg";

const InviteModal = ({ onClose, onAddFriendClick, modalRef }) => {

  return (
    <div className="invite-modal" ref={modalRef}>
      <div className="modal-top-row">
        <div className="modal-close" onClick={onClose}>x</div>
        <div className="invite-search-bar">
          <input type="text" placeholder="닉네임 검색" />
          <img src={search2} alt="Search" />
        </div>
        <button onClick={onAddFriendClick} className="invite-add-btn">+ 친구 추가</button>
      </div>

      <div className="text-wrapper-2">친구 목록</div>

      <div className="friend-item">
        <div className="rectangle" />
        <div className="text-wrapper-5">상상부기</div>
        <div className="frame"><div className="text-wrapper-8">초대</div></div>
      </div>

      <div className="friend-item">
        <div className="rectangle-2" />
        <div className="text-wrapper-4">상찌</div>
        <div className="frame-2"><div className="text-wrapper-8">초대</div></div>
      </div>

      <div className="friend-item">
        <div className="rectangle-3" />
        <div className="text-wrapper-6">한성냥이</div>
        <div className="div-wrapper"><div className="text-wrapper-8">초대</div></div>
      </div>

      <div className="friend-item">
        <div className="rectangle-4" />
        <div className="text-wrapper-7">꼬꼬꾸꾸</div>
        <div className="frame-3"><div className="text-wrapper-8">초대</div></div>
      </div>

      <div className="friend-item">
        <div className="rectangle-5" />
        <div className="text-wrapper-10">멍멍이</div>
        <div className="frame-4"><div className="text-wrapper-8">초대</div></div>
      </div>

      <div className="gray-line" style={{ top: "262px" }} />
      <div className="gray-line" style={{ top: "362px" }} />
      <div className="gray-line" style={{ top: "462px" }} />
      <div className="gray-line" style={{ top: "562px" }} />
    </div>
  );
};

export default InviteModal;