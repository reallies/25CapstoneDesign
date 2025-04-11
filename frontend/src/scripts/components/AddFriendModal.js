import React, { useState } from "react";
import "./AddFriendModal.css";
import search2 from "../../assets/images/search2.svg";

const AddFriendModal = ({ onClose, anchorRef, modalRef }) => {
  // 초기 더미 친구 목록
  const initialAddableFriends = ["상상부기", "상찌", "한성냥이", "꼬꼬꾸꾸", "멍멍이"];

  // 상태 관리
  const [pendingAdds, setPendingAdds] = useState([]);
  const [addListState] = useState(initialAddableFriends);

  // 추가 버튼 클릭 시 대기중 상태 토글
  const handleAdd = (name) => {
    if (pendingAdds.includes(name)) {
      setPendingAdds(pendingAdds.filter(n => n !== name));
    } else {
      setPendingAdds([...pendingAdds, name]);
    }
  };

  return (
    <div className="add-friend-modal fixed-position" ref={modalRef}>
      <div className="modal-header">
        <div className="invite-search-bar">
          <input type="text" placeholder="닉네임 검색" />
          <img src={search2} alt="Search" />
        </div>
      </div>
      <div className="text-wrapper-2">친구 추가</div>
      {addListState.map((name, index) => (
        <div key={index}>
          <div className="friend-item">
            <div className="rectangle" />
            <div className="user-name">{name}</div>
            <div className="button-group">
              {pendingAdds.includes(name) ? (
                <div className="frame pending" onClick={() => handleAdd(name)}>대기중</div>
              ) : (
                <div className="frame" onClick={() => handleAdd(name)}>추가</div>
              )}
            </div>
          </div>
          {index !== addListState.length - 1 && <div className="gray-line" />}
        </div>
      ))}
    </div>
  );
};

export default AddFriendModal;
