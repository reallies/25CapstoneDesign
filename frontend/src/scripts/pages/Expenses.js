import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Expenses.css";

// SVG 아이콘 import
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

  const toggleReceipt = () => {
    setIsReceiptOpen(!isReceiptOpen);
  };

  const days = [
    "여행 준비",
    "DAY 1",
    "DAY 2",
    "DAY 3",
    "DAY 4",
    "DAY 5",
    "DAY 6",
    "DAY 7",
  ];

  return (
    <div className="expenses">
      <div className="div">
        {/* 상단 3열 구조 */}
        <div className="expense-header-row">
          {/* 타이틀 */}
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
              <Link to="/expenses" className="expense-menu-item">
                가계부
              </Link>
              <div className="expense-menu-item">초대</div>
              <div className="expense-menu-item">내 기록</div>
            </div>
          </div>

          {/* 공동경비 */}
          <div className="shared-expense-box expense-card">
            <div className="shared-settle-wrapper">
              <button className="shared-settle-btn">정산하기</button>
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
                {/* 회전 애니메이션 적용 */}
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

        {/* 지출 리스트와 입력 */}
        <div className="expense-list">
          {/* 왼쪽 리스트 */}
          <div className="expense-category-list">
            <div className="expense-item">
              <div className="expense-icon eat"><Eat /></div>
              식비
              <div className="expense-cost">-30,000원</div>
            </div>
            <div className="expense-item">
              <div className="expense-icon sightseeing"><Sightseeing /></div>
              관광
              <div className="expense-cost">-40,000원</div>
            </div>
            <div className="expense-item">
              <div className="expense-icon traffic"><Traffic /></div>
              교통
              <div className="expense-cost">-5,000원</div>
            </div>
            <div className="expense-item">
              <div className="expense-icon shopping"><Shopping /></div>
              쇼핑
              <div className="expense-cost">-25,000원</div>
            </div>
          </div>

          {/* 오른쪽 입력 영역 */}
          <div className="expense-input-form">
            <label>지출비용</label>
            <input className="expense-input" type="number" placeholder="0" />
            <label>지출내용</label>
            <input className="expense-input" type="text" placeholder="내용 입력하기" />
            <label>카테고리</label>
            <div className="expense-category-select">
              {/* 아이콘 + 텍스트 분리 구조 */}
              <div className="category-wrapper">
                <div className="category-option traffic"><Traffic /></div>
                <span className="category-label">교통</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option eat"><Eat /></div>
                <span className="category-label">식비</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option lodging"><Lodging /></div>
                <span className="category-label">숙박</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option sightseeing"><Sightseeing /></div>
                <span className="category-label">관광</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option activity"><Activity /></div>
                <span className="category-label">액티비티</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option shopping"><Shopping /></div>
                <span className="category-label">쇼핑</span>
              </div>
              <div className="category-wrapper">
                <div className="category-option etc"><Etc /></div>
                <span className="category-label">기타</span>
              </div>
            </div>
            <button className="add-expense-btn">추가하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
