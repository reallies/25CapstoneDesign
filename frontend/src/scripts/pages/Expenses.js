import React, { useState, useRef, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Expenses.css";
import InviteModal from "../components/InviteModal";
import AddFriendModal from "../components/AddFriendModal";
import SettleUpModal from "../components/SettleUpModal";

import { ReactComponent as Eat } from "../../assets/images/eat.svg";
import { ReactComponent as Traffic } from "../../assets/images/traffic.svg";
import { ReactComponent as Lodging } from "../../assets/images/lodging.svg";
import { ReactComponent as Sightseeing } from "../../assets/images/sightseeing.svg";
import { ReactComponent as Activity } from "../../assets/images/activity.svg";
import { ReactComponent as Shopping } from "../../assets/images/shopping.svg";
import { ReactComponent as Etc } from "../../assets/images/etc.svg";

export const Expenses = () => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeDay, setActiveDay] = useState("DAY 1");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const inviteModalRef = useRef(null);
  const addModalRef = useRef(null);
  const navigate = useNavigate();

  const toggleReceipt = () => setIsReceiptOpen(!isReceiptOpen);

  const days = [
    "여행 준비", "DAY 1", "DAY 2", "DAY 3", "DAY 4", "DAY 5", "DAY 6", "DAY 7"
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      const invite = inviteModalRef.current;
      const add = addModalRef.current;
      const outsideInvite = invite && !invite.contains(e.target);
      const outsideAdd = add && !add.contains(e.target);

      if (isAddOpen && !isInviteOpen && outsideAdd) {
        setIsAddOpen(false);
        return;
      }
      if (isInviteOpen && !isAddOpen && outsideInvite) {
        setIsInviteOpen(false);
        return;
      }
      if (isAddOpen && isInviteOpen && outsideAdd && outsideInvite) {
        setIsAddOpen(false);
        setIsInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInviteOpen, isAddOpen]);

  return (
    <div className="expenses">
      <div className="div">
        {/* 상단 영역 */}
        <div className="expense-header-row">
          <div className="expense-header">
            <div className="expense-title-sub">AI 일정과 함께하는</div>
            <div className="travel-title-wrap">
              <div className="travel-title">전북 여행</div>
              <div className="travel-edit">편집</div>
            </div>

            <div className="expense-tags">
              <div className="expense-tag">#전주시</div>
              <div className="expense-tag">#익산시</div>
              <div className="expense-tag">#군산시</div>
            </div>

            <div className="expense-menu">
              <Link to="/expenses" className="expense-menu-item">가계부</Link>
              <div
                className="expense-menu-item"
                onClick={() => setIsInviteOpen(true)}
              >
                초대
              </div>
              <div className="expense-menu-item" onClick={() => navigate("/schedules")}>
                여행 일정
              </div>
            </div>
          </div>

          {/* 공동 경비 박스 */}
          <div className="shared-expense-box expense-card">
            <div className="shared-settle-wrapper">
              <button className="shared-settle-btn" onClick={() => setIsSettlementOpen(true)}>정산하기</button>
            </div>
            <div className="shared-info">
              <h3>공동경비</h3>
              <div className="shared-amount-wrapper">
                <div className="shared-amount">100,000원</div>
                <div className="shared-edit">수정</div>
              </div>
              <div className="shared-divider" />
              <div className="shared-summary">
                <div className="summary-item">
                  <span className="label">모인 돈</span>
                  <span className="value">100,000원</span>
                </div>
                <div className="vertical-divider" />
                <div className="summary-item">
                  <span className="label red">총 쓴 돈</span>
                  <span className="value">100,000원</span>
                </div>
              </div>
            </div>
          </div>

          {/* 정산 영수증 */}
          <div className="expense-card receipt-box">
            <div className="receipt-header">
              <span className="receipt-title">정산 영수증</span>
              <span className="receipt-toggle" onClick={toggleReceipt}>
                {isReceiptOpen ? "닫기" : "펼쳐보기"}
                <span className={`dropdown-arrow ${isReceiptOpen ? "rotate" : ""}`}>∨</span>
              </span>
            </div>
            <div className="receipt-label">보낼 돈</div>
            <hr className="receipt-divider" />
            <div className="receipt-person">
              <div className="receipt-info">
                <div className="receipt-avatar" />
                <div className="receipt-name"><strong>꼬꼬꾸꾸</strong> 에게</div>
              </div>
              <div className="receipt-amount">33,333원</div>
            </div>

            {isReceiptOpen && (
              <div className="receipt-detail">
                <div className="receipt-detail-title">친구별 지출 상세</div>
                <hr className="receipt-divider" />
                {[
                  { name: "상찌", amount: "33,333원" },
                  { name: "한성냥이", amount: "33,333원" },
                  { name: "꼬꼬꾸꾸", amount: "0원" },
                ].map((person, idx) => (
                  <div className="receipt-person" key={idx}>
                    <div className="receipt-info">
                      <div className="receipt-avatar" />
                      <div className="receipt-name">{person.name}</div>
                    </div>
                    <div className="receipt-amount">{person.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isSettlementOpen && (
          <>
            {console.log("SettleUpModal is rendering")}
            <SettleUpModal
              isOpen={isSettlementOpen}
              onClose={() => setIsSettlementOpen(false)}
              totalAmount={100000}
              friends={["상상부기", "상찌", "한성냥이", "꼬꼬꾸꾸"]}
            />
          </>
        )}

        {isInviteOpen && (
          <InviteModal
            onClose={() => {
              setIsInviteOpen(false);
              setIsAddOpen(false);
            }}
            onAddFriendClick={() => setIsAddOpen(true)}
            modalRef={inviteModalRef}
            className="expenses-modal"
          />
        )}

        {isAddOpen && (
          <AddFriendModal
            onClose={() => setIsAddOpen(false)}
            anchorRef={inviteModalRef}
            modalRef={addModalRef}
            className="expenses-modal"
          />
        )}

        {/* DAY 탭 */}
        <div className="expense-days">
          {days.map((day) => (
            <div
              key={day}
              className={`day-tab ${activeDay === day ? "active" : ""}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 지출 영역 */}
        <div className="expense-list">
          <div className="expense-category-list">
            <div className="expense-item"><div className="expense-icon eat"><Eat /></div>식비<div className="expense-cost">-30,000원</div></div>
            <div className="expense-item"><div className="expense-icon sightseeing"><Sightseeing /></div>관광<div className="expense-cost">-40,000원</div></div>
            <div className="expense-item"><div className="expense-icon traffic"><Traffic /></div>교통<div className="expense-cost">-5,000원</div></div>
            <div className="expense-item"><div className="expense-icon shopping"><Shopping /></div>쇼핑<div className="expense-cost">-25,000원</div></div>
          </div>

          <div className="expense-input-form">
            <label>지출비용</label>
            <input className="expense-input" type="number" placeholder="0" />
            <label>지출내용</label>
            <input className="expense-input" type="text" placeholder="내용 입력하기" />
            <label>카테고리</label>
            <div className="expense-category-select">
              <div className="category-wrapper"><div className="category-option traffic"><Traffic /></div><span className="category-label">교통</span></div>
              <div className="category-wrapper"><div className="category-option eat"><Eat /></div><span className="category-label">식비</span></div>
              <div className="category-wrapper"><div className="category-option lodging"><Lodging /></div><span className="category-label">숙박</span></div>
              <div className="category-wrapper"><div className="category-option sightseeing"><Sightseeing /></div><span className="category-label">관광</span></div>
              <div className="category-wrapper"><div className="category-option activity"><Activity /></div><span className="category-label">액티비티</span></div>
              <div className="category-wrapper"><div className="category-option shopping"><Shopping /></div><span className="category-label">쇼핑</span></div>
              <div className="category-wrapper"><div className="category-option etc"><Etc /></div><span className="category-label">기타</span></div>
            </div>
            <button className="add-expense-btn">추가하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
