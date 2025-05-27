import React from "react";
import "./SettleUpModal.css";

const SettleUpModal = ({ isOpen, onClose, settlementData, participants, currentUserNickname }) => {
  if (!isOpen) return null;

  const totalAmount = settlementData?.total_amount || 0;
  const settlements = settlementData?.settlements || [];
  const userExpenses = settlementData?.userExpenses || [];
  const userSettlements = settlements.filter(
    (s) => s.from === currentUserNickname || s.to === currentUserNickname
  );

  return (
    <div className="settleup-modal-overlay">
      <div className="settleup-modal-box">
        <button className="settleup-close-btn" onClick={onClose}>✕</button>
        <h2 className="settleup-title">정산하기</h2>
        <p className="settleup-amount">{totalAmount.toLocaleString()}원</p>
        <div className="settleup-list">
          <div className="settleup-participants">
          <h3>나의 송금 내역</h3>
          {userSettlements.filter(s => s.from === currentUserNickname).length > 0 ? (
            userSettlements
            .filter(s => s.from === currentUserNickname)
              .map((settlement, index) => (
                <div key={index} className="settleup-item">
                  <span className="settleup-friend">나 → {settlement.to}</span>
                  <span className="settleup-amount">{settlement.amount.toLocaleString()}원</span>
                </div>
              ))
          ) : (
            <p>송금할 내역이 없습니다.</p>
          )}
          </div>
          <div className="settleup-participants">
            <h3>전체 송금 내역</h3>
            {settlements.length > 0 ? (
              settlements.map((settlement, index) => (
                <div key={index} className="settleup-item">
                  <span className="settleup-friend">
                      {settlement.from === currentUserNickname ? "나" : settlement.from}
                      {" → "}
                      {settlement.to === currentUserNickname ? "나" : settlement.to}
                  </span>
                  <span className="settleup-amount">{settlement.amount.toLocaleString()}원</span>
                </div>
              ))
            ) : (
              <p>정산 정보가 없습니다.</p>
            )}
          </div>
          <div className="settleup-participants">
            <h3>유저별 지출 상세</h3>
            {userExpenses.length > 0 ? (
              userExpenses.map((expense, index) => (
                <div key={index} className="settleup-participant">
                  {expense.nickname === currentUserNickname ? "나" : expense.nickname}: {expense.total.toLocaleString()}원
                </div>
              ))
            ) : (
              <p>지출 정보가 없습니다.</p>
            )}
          </div>
          <div className="settleup-participants">
            <h3>초대된 친구</h3>
            {participants.filter(p => p.nickname !== currentUserNickname).length > 0 ? (
              participants
                .filter(p => p.nickname !== currentUserNickname)
                .map((participant, index) => (
                  <div key={index} className="settleup-participant">
                    {participant.nickname}
                  </div>
                ))
            ) : (
              <p>초대된 친구가 없습니다.</p>
            )}
          </div>
        </div>
        <button className="settleup-confirm-btn" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default SettleUpModal;