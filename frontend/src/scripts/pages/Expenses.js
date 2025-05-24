import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Expenses.css";
import InviteModal from "../components/InviteModal";
import SettleUpModal from "../components/SettleUpModal";
import { ReactComponent as Eat } from "../../assets/images/eat.svg";
import { ReactComponent as Traffic } from "../../assets/images/traffic.svg";
import { ReactComponent as Lodging } from "../../assets/images/lodging.svg";
import { ReactComponent as Sightseeing } from "../../assets/images/sightseeing.svg";
import { ReactComponent as Activity } from "../../assets/images/activity.svg";
import { ReactComponent as Shopping } from "../../assets/images/shopping.svg";
import { ReactComponent as Etc } from "../../assets/images/etc.svg";

export const Expenses = () => {
  const { trip_id } = useParams();
  const { token, user } = useContext(AuthContext);
  const currentUserNickname = user?.nickname || "Unknown";
  
  const [trip, setTrip] = useState(null);
  const [dayTabs, setDayTabs] = useState([]);
  const [activeDay, setActiveDay] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [settlementData, setSettlementData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inviteModalRef = useRef(null);
  const addModalRef = useRef(null);

  const categories = [
    { label: "교통", type: "TRANSPORT", icon: <Traffic />, class: "traffic" },
    { label: "식비", type: "FOOD", icon: <Eat />, class: "eat" },
    { label: "숙박", type: "ACCOMMODATION", icon: <Lodging />, class: "lodging" },
    { label: "관광", type: "TICKET", icon: <Sightseeing />, class: "sightseeing" },
    { label: "액티비티", type: "ACTIVITY", icon: <Activity />, class: "activity" },
    { label: "쇼핑", type: "SHOPPING", icon: <Shopping />, class: "shopping" },
    { label: "기타", type: "OTHER", icon: <Etc />, class: "etc" },
  ];

  const typeToIcon = {
    FOOD: <Eat />,
    TRANSPORT: <Traffic />,
    ACCOMMODATION: <Lodging />,
    TICKET: <Sightseeing />,
    ACTIVITY: <Activity />,
    SHOPPING: <Shopping />,
    OTHER: <Etc />,
  };

  const typeToClass = {
    FOOD: "eat",
    TRANSPORT: "traffic",
    ACCOMMODATION: "lodging",
    TICKET: "sightseeing",
    ACTIVITY: "activity",
    SHOPPING: "shopping",
    OTHER: "etc",
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.trip) {
          setTrip(data.trip);

          const tripDays = data.trip.days || [];
          const preparationTab = { label: "여행 준비", day_id: null };
          const dayTabsArray = tripDays.map((day, index) => ({
            label: `DAY ${index + 1}`,
            day_id: day.day_id,
          }));

          setDayTabs([preparationTab, ...dayTabsArray]);
          setActiveDay(preparationTab.label);
        }
      } catch (err) {
        console.error("여행 정보를 불러오지 못함:", err);
      }
    };

    if (trip_id) fetchTrip();
  }, [trip_id]);

  // Function to fetch settlement data
  const fetchSettlementData = async () => {
    try {
      const response = await fetch(`/trip/${trip_id}/settle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch settlement");
      const data = await response.json();
      setSettlementData(data);
      console.log("Settlement Data:", data);
    } catch (error) {
      console.error("Error fetching settlement:", error);
      setSettlementData(null);
    }
  };

  // Fetch settlement data on mount or when trip_id/token changes
  useEffect(() => {
    if (trip_id && token) {
      fetchSettlementData();
    }
  }, [trip_id, token, fetchSettlementData]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!activeDay || !trip_id || !dayTabs.length) {
        console.log("Skipping fetchExpenses:", { activeDay, trip_id, dayTabs });
        return;
      }
      setIsLoading(true);
      const selectedDay = dayTabs.find((tab) => tab.label === activeDay);
      const day_id = selectedDay ? selectedDay.day_id : null;
      console.log("Fetching expenses for:", { activeDay, day_id });
      try {
        const url = `/trip/${trip_id}/expenses?day_id=${day_id === null ? "null" : day_id}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch expenses");
        const data = await response.json();
        setExpenses(data.expenses || []);
        console.log("Expenses Data:", data.expenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [activeDay, trip_id, token, dayTabs]);

  const handleAddExpense = async () => {
    if (!cost || !description || !category) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    const selectedDay = dayTabs.find((tab) => tab.label === activeDay);
    const day_id = selectedDay ? selectedDay.day_id : null;
    try {
      const response = await fetch("/trip/expense/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_id,
          day_id,
          type: category,
          title: description,
          price: parseFloat(cost),
        }),
      });
      if (!response.ok) throw new Error("Failed to add expense");
      const data = await response.json();
      setExpenses([...expenses, data.expense]);
      setCost("");
      setDescription("");
      setCategory("");
      // Fetch updated settlement data after adding expense
      await fetchSettlementData();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("지출 추가에 실패했습니다.");
    }
  };

  const toggleReceipt = () => setIsReceiptOpen(!isReceiptOpen);

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

  const userSettlements = settlementData?.settlements?.filter(
    (s) => s.from === currentUserNickname || s.to === currentUserNickname
  ) || [];

  return (
    <div className="expenses">
      <div className="div">
        <div className="expense-header-row">
          <div className="expense-header">
            <div className="expense-title-sub">AI 일정과 함께하는</div>
            <div className="travel-title-wrap">
              <div className="travel-title">{trip?.title}</div>
              {/*<div className="travel-edit">편집</div>*/}
            </div>
            <div className="expense-tags">
              {trip?.destinations?.map((d) => (
                <div className="expense-tag" key={d}>#{d}</div>
              ))}
            </div>
            <div className="expense-menu">
              <Link to={`/schedule/${trip_id}`} className="expense-menu-item">일정</Link>
              <div className="expense-menu-item" onClick={() => setIsInviteOpen(true)}>초대</div>
              <div className="expense-menu-item">내 기록</div>
            </div>
          </div>

          <div className="shared-expense-box expense-card">
            <div className="shared-settle-wrapper">
              <button className="shared-settle-btn" onClick={() => setIsSettlementOpen(true)}>정산하기</button>
            </div>
            <div className="shared-info">
              <h3>공동경비</h3>
              <div className="shared-amount-wrapper">
                <div className="shared-amount">{settlementData ? settlementData.total_amount.toLocaleString() : 0}원</div>
              </div>
              <div className="shared-divider" />
              <div className="shared-summary">
                <div className="summary-item">
                  <span className="label">내 지출</span>
                  <span className="value">{settlementData ? settlementData.total_amount.toLocaleString() : 0}원</span>
                </div>
                <div className="vertical-divider" />
                <div className="summary-item">
                  <span className="label red">총 지출</span>
                  <span className="value">{settlementData ? settlementData.total_amount.toLocaleString() : 0}원</span>
                </div>
              </div>
            </div>
          </div>

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
            {userSettlements.length > 0 ? (
              userSettlements.map((settlement, index) => (
                <div className="receipt-person" key={index}>
                  <div className="receipt-info">
                    <div className="receipt-avatar" />
                    <div className="receipt-name">
                      {settlement.from === currentUserNickname
                        ? `당신 → ${settlement.to}`
                        : `${settlement.from} → 당신`}
                    </div>
                  </div>
                  <div className="receipt-amount">{settlement.amount.toLocaleString()}원</div>
                </div>
              ))
            ) : (
              <div className="receipt-person">
                <div className="receipt-info">
                  <div className="receipt-avatar" />
                  <div className="receipt-name">송금할 내역 없음</div>
                </div>
                <div className="receipt-amount">0원</div>
              </div>
            )}
            {isReceiptOpen && (
              <div className="receipt-detail">
                <div className="receipt-detail-title">친구별 지출 상세</div>
                <hr className="receipt-divider" />
                {settlementData?.userExpenses?.length > 0 ? (
                  settlementData.userExpenses.map((expense, index) => (
                    <div className="receipt-person" key={index}>
                      <div className="receipt-info">
                        <div className="receipt-avatar" />
                        <div className="receipt-name">{expense.nickname}</div>
                      </div>
                      <div className="receipt-amount">{expense.total.toLocaleString()}원</div>
                    </div>
                  ))
                ) : (
                  <div className="receipt-person">
                    <div className="receipt-info">
                      <div className="receipt-avatar" />
                      <div className="receipt-name">지출 정보 없음</div>
                    </div>
                    <div className="receipt-amount">0원</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isSettlementOpen && (
          <SettleUpModal
            isOpen={isSettlementOpen}
            onClose={() => setIsSettlementOpen(false)}
            settlementData={settlementData}
            participants={participants}
            currentUserNickname={currentUserNickname}
          />
        )}

        {isInviteOpen && (
          <InviteModal
            position={{top: "207px", left: "100px"}}
            onClose={() => {
              setIsInviteOpen(false);
              setIsAddOpen(false);
            }}
            tripId={trip_id}
            modalRef={inviteModalRef}
          />
        )}

        <div className="expense-days">
          {dayTabs.length > 0 &&
            dayTabs.map((tab) => (
              <div
                key={tab.label}
                className={`day-tab ${activeDay === tab.label ? "active" : ""}`}
                onClick={() => setActiveDay(tab.label)}
              >
                {tab.label}
              </div>
            ))}
        </div>

        <div className="expense-list">
          <div className="expense-category-list">
            {!isLoading && expenses.length === 0 ? (
              <p>지출 내역이 없습니다.</p>
            ) : (
              expenses.map((expense, index) => (
                <div className="expense-item" key={index}>
                  <div className={`expense-icon ${typeToClass[expense.type] || "etc"}`}>
                    {typeToIcon[expense.type] || <Etc />}
                  </div>
                  {expense.title}
                  <div className="expense-cost">-{expense.price.toLocaleString()}원</div>
                </div>
              ))
            )}
          </div>

          <div className="expense-input-form">
            <label>지출비용</label>
            <input
              className="expense-input"
              type="number"
              placeholder="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <label>지출내용</label>
            <input
              className="expense-input"
              type="text"
              placeholder="내용 입력하기"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label>카테고리</label>
            <div className="expense-category-select">
              {categories.map((cat) => (
                <div
                  className={`category-wrapper ${category === cat.type ? "selected" : ""}`}
                  key={cat.type}
                  onClick={() => setCategory(cat.type)}
                >
                  <div className={`category-option ${cat.class}`}>
                    {cat.icon}
                  </div>
                  <span className="category-label">{cat.label}</span>
                </div>
              ))}
            </div>
            <button className="add-expense-btn" onClick={handleAddExpense}>추가하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;