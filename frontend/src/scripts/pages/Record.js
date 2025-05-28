//Record.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import KakaoMap from '../components/RecordKakaoMap'; // 카카오 맵 컴포넌트
import photoIcon from '../../assets/images/camera.svg';
import AlertModal from "../components/AlertModal";
import './Record.css';
import ChatBot from "../components/ChatBot";

const Record = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); //유저 데이터

  const pinRef = useRef(null);         // 핀 아이콘 위치 참조
  const modalRef = useRef(null);       // 모달 감지용 참조

  // 폼 필드 참조
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const contentRef = useRef(null);

  const alertShownRef = useRef(false);

  // 상태 관리
  const [trips, setTrips] = useState(null); // 여행 데이터
  const [selectedTripId, setSelectedTripId] = useState(null); // 선택된 여행 ID
  const [selectedTripData, setSelectedTripData] = useState(null); //선택된 여행 데이터
  const [isTripModalOpen, setIsTripModalOpen] = useState(false); // 여행 선택 모달 열림 여부
  const [recordImageList, setRecordImageList] = useState([]); // 업로드된 이미지 목록
  const [isModalOpen, setIsModalOpen] = useState(false);      // 모달 열림 여부
  const [isFocused, setIsFocused] = useState(false);          // 검색창 포커스 상태
  const [days, setDays] = useState([]);                       // day 데이터 상태
  const [activeDay, setActiveDay] = useState('ALL');          // 전체 or 인덱스
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");



  // 현재 시간 포맷팅 (예: "2025. 05. 19 PM 09:03")
  const now = new Date();
  const hour12 = now.getHours() % 12 || 12;
  const ampm = now.getHours() < 12 ? 'AM' : 'PM';
  const pad2 = num => String(num).padStart(2, '0');
  const formattedTime =
    `${now.getFullYear()}. ${pad2(now.getMonth() + 1)}. ${pad2(now.getDate())} ` +
    `${ampm} ${pad2(hour12)}:${pad2(now.getMinutes())}`;

  // 여행 리스트 불러오기
  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch('http://localhost:8080/schedule/myTrips', { credentials: 'include' });
        const data = await res.json();
        // 최신 순 정렬
        const sorted = [...data.trips].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setTrips(sorted);
      } catch (err) {
        console.error('여행 목록 불러오기 실패:', err);
      }
    };
    fetchTrips();
  }, []);

  // 1) 여정 선택 시 days 로드 
  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`http://localhost:8080/schedule/${selectedTripId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setDays(data.trip.days);
        setSelectedTripData(data.trip);
      })
      .catch(console.error);
  }, [selectedTripId]);


  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !pinRef.current.contains(e.target)
      ) {
        setIsModalOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen, isFocused]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !pinRef.current.contains(e.target)
      ) {
        setIsModalOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen, isFocused]);

  const filteredDays =
    activeDay === 'ALL'
      ? days
      : [days[activeDay]];


  // 여정 선택 핸들러
  const handleTripSelect = (trip) => {
    setSelectedTripId(trip.trip_id);
    setSelectedTripData(trip);
    setIsTripModalOpen(false);
  };

  // Image upload preview
  const handleRecordImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    try {
      // 2) 서버로 multipart/form-data POST
      const res = await fetch("http://localhost:8080/posts/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const { url } = await res.json();

      // 3) 받은 URL을 프리뷰 배열에 추가
      setRecordImageList(prev => [...prev, url]);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
    }
  };

  //여정 모달 토글
  const toggleTripModal = () => {
    setIsTripModalOpen(open => !open);
  };

  // **서버로 데이터 전송하는 핸들러**
  const handleSubmit = async () => {
    const trip_id = selectedTripId;
    const title = titleRef.current.value.trim();
    const subtitle = subtitleRef.current.value.trim();
    const content = contentRef.current.value.trim();

    if (!selectedTripId) {
      if (!alertShownRef.current) {
        alertShownRef.current = true;
        setAlertText("여행을 선택해주세요.");
        setAlertOpen(true);
        setTimeout(() => {
          alertShownRef.current = false;
        }, 1000);
        return
      }
    }

    if (title === '제목' || subtitle === '부제목' || !content) {
      if (!alertShownRef.current) {
        alertShownRef.current = true;
        setAlertText("제목과 내용을 모두 입력해주세요.");
        setAlertOpen(true);
        setTimeout(() => {
          alertShownRef.current = false;
        }, 1000);
        return
      }
    }

    // 백엔드가 받도록 하는 json 데이터
    const body = {
      trip_id,
      title,
      content: subtitle
        ? `${subtitle}\n\n${content}`      // 부제목과 본문 합치기
        : content,
      visibility: "PUBLIC",                  // 필요에 따라 선택지도 추가
      image_urls: recordImageList,           // 실제 서버 URL이 담긴 배열
    };

    try {
      const res = await fetch("http://localhost:8080/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.post) {
        // 성공하면 이전 페이지(혹은 상세 페이지)로
        navigate(-1);
      } else {
        alert(data.message || "업로드에 실패했습니다.");
      }
    } catch (err) {
      console.error("업로드 오류:", err);
      alert("서버 요청 중 오류가 발생했습니다.");
    }
  };

  const handleAutoResize = (e) => {
    e.target.style.height = 'auto';               // 기존 높이 초기화
    e.target.style.height = `${e.target.scrollHeight}px`;  // 스크롤 높이에 맞춰 늘리기
  };

  return (
    <div className="record-container">
      {/* 제목 입력 */}
      <input
        ref={titleRef}
        type="text"
        className="record-title"
        defaultValue="제목"
        onFocus={(e) => {
          if (e.target.value === "제목") {
            e.target.value = "";
          }
        }}
        onBlur={(e) => {
          if (e.target.value.trim() === "") {
            e.target.value = "제목";
          }
        }}
      />

      {/* 부제목 입력 */}
      <input
        ref={subtitleRef}
        type="text"
        className="record-subtitle"
        defaultValue="부제목을 입력해주세요"
        onFocus={(e) => {
          if (e.target.value === "부제목을 입력해주세요") {
            e.target.value = "";
          }
        }}
        onBlur={(e) => {
          if (e.target.value.trim() === "") {
            e.target.value = "부제목을 입력해주세요";
          }
        }}
      />

      {/* 작성자 정보 및 버튼 영역 */}
      <div className="record-meta">
        <img className="profile-circle" src={user?.image_url || photoIcon} alt='' />
        <div className="record-meta-text">
          <span className="record-nickname">{user?.nickname || '로드 중...'}</span>
          <div className="record-time">{formattedTime}</div>
        </div>

        <div className="record-buttons">
          {/* 이미지 업로드 버튼 */}
          <img
            src={photoIcon}
            alt=""
            className="record-icon"
            onClick={() => document.getElementById("record-file-upload").click()}
          />
          <input
            id="record-file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleRecordImageUpload}
            style={{ display: "none" }}
          />

          {/* 올리기/취소 버튼 */}
          <button className="record-button" onClick={toggleTripModal}>
            {selectedTripData ? `선택된 여정: ${selectedTripData.title}` : "여정 선택"}
          </button>
          <button className="record-submit" onClick={handleSubmit}>올리기</button>
        </div>
      </div>

      <hr className="record-divider" />
      {/* ● 6) 여정 선택용 모달 */}
      {isTripModalOpen && (
        <div className="record-modal-backdrop" onClick={toggleTripModal}>
          <div className="record-modal-box" onClick={e => e.stopPropagation()}>
            <h2>여정 선택</h2>
            <div className="record-trip-list">
              {trips.map(trip => (
                <div key={trip.trip_id} className="record-trip-item">
                  <div className="trip-info">
                    <strong style={{ fontSize: 18 }}>{trip.title}</strong>
                    <div style={{ margin: "5px 0" }}>
                      {trip.start_date.split('T')[0]} – {trip.end_date.split('T')[0]}
                    </div>
                  </div>
                  <button
                    className="trip-select-btn"
                    onClick={() => handleTripSelect(trip)}
                  >
                    선택
                  </button>
                </div>
              ))}
              {trips.length === 0 && <p>등록된 여정이 없습니다.</p>}
            </div>
            <button className="modal-close-btn" onClick={toggleTripModal}>
              닫기
            </button>
          </div>
        </div>
      )
      }

      {/* 여정 선택 뒤에만 DAY 탭과 지도 */}
      {selectedTripData && days.length > 0 && (
        <>
          {/* DAY 탭 */}
          <div className="record-day-tabs">
            <button
              className={`record-day-tab ${activeDay === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveDay('ALL')}
            >
              전체 보기
            </button>
            {days.map((_, idx) => (
              <button
                key={idx}
                className={`record-day-tab ${activeDay === idx ? 'active' : ''}`}
                onClick={() => setActiveDay(idx)}
              >
                DAY {idx + 1}
              </button>
            ))}
          </div>

          {/* KakaoMap 렌더링 */}
          <div className='record-map-wrapper'>
            <KakaoMap days={filteredDays} />
          </div>
        </>
      )}

      {/* 이미지 추가 시 미리보기와 추가 입력창 표시 */}
      {
        recordImageList.length > 0 && (
          <>
            <div className="record-preview-container">
              {recordImageList.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`record-preview-${idx}`}
                  className="record-preview-img"
                />
              ))}

            </div>
          </>
        )
      }

      {/* 메인 글쓰기 텍스트 영역 */}
      <textarea
        ref={contentRef}
        className="record-placeholder"
        defaultValue="나만의 여행을 기록해주세요!"
        onFocus={(e) => {
          if (e.target.value === "나만의 여행을 기록해주세요!")
            e.target.value = "";
        }}
        onInput={handleAutoResize}  // 키 입력마다 호출
        onBlur={(e) => {
          if (e.target.value.trim() === "") {
            e.target.value = "나만의 여행을 기록해주세요!";
          }
        }}

      />
      {/* 경고 모달 */}
      {alertOpen && (
        <AlertModal text={alertText} onClose={() => setAlertOpen(false)} />
      )}

      {/* 하단 챗봇 컴포넌트 */}
      <ChatBot />

    </div >
  );
};

export default Record;