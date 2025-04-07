import React, { useEffect } from "react";
import "./AddFriendModal.css";
import search2 from "../../assets/images/search2.svg";

const AddFriendModal = ({ onClose, anchorRef, modalRef }) => {

    useEffect(() => {
        const handleClickOutside = (e) => {
        const invite = anchorRef?.current;
        const add = modalRef?.current;
    
        if (!invite || !add) return;
    
        const isClickOutsideAdd = !add.contains(e.target);
        const isClickOutsideInvite = !invite.contains(e.target);
    
        if (isClickOutsideAdd && isClickOutsideInvite) {
            onClose();
        }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, anchorRef, modalRef]);
  

  return (
    <div
        className="add-friend-modal fixed-position"
        ref={modalRef}
    >
    <div className="modal-header">
    <div className="invite-search-bar">
        <input type="text" placeholder="닉네임 검색" />
        <img src={search2} alt="Search" />
    </div>
    </div>

    <div className="text-wrapper-2">친구 추가</div>
      <div className="friend-item">
        <div className="rectangle" />
        <div className="text-wrapper-5">상상부기</div>
        <div className="frame">
          <div className="text-wrapper-8">추가</div>
        </div>
      </div>

      <div className="friend-item">
        <div className="rectangle-2" />
        <div className="text-wrapper-4">상찌</div>
        <div className="frame-2">
          <div className="text-wrapper-8">추가</div>
        </div>
      </div>

      <div className="friend-item">
        <div className="rectangle-3" />
        <div className="text-wrapper-6">한성냥이</div>
        <div className="div-wrapper">
          <div className="text-wrapper-8">추가</div>
        </div>
      </div>

      <div className="friend-item">
        <div className="rectangle-4" />
        <div className="text-wrapper-7">꼬꼬꾸꾸</div>
        <div className="frame-3">
          <div className="text-wrapper-8">추가</div>
        </div>
      </div>

      <div className="friend-item">
        <div className="rectangle-6" />
        <div className="text-wrapper-11">멍멍이</div>
        <div className="frame-5">
            <div className="text-wrapper-8">추가</div>
        </div>
    </div>

      <div className="gray-line" style={{ top: "262px" }} />
      <div className="gray-line" style={{ top: "362px" }} />
      <div className="gray-line" style={{ top: "462px" }} />
      <div className="gray-line" style={{ top: "562px" }} />
    </div>
  );
};

export default AddFriendModal;
