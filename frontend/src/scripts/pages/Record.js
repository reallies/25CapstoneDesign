//Record.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import KakaoMap from '../components/RecordKakaoMap'; // 카카오 맵 컴포넌트
import photoIcon from '../../assets/images/camera.svg';
import { AlertModal } from "../components/AlertModal";
import './Record.css';
import ChatBot from "../components/ChatBot";

const Record = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); //유저 데이터

  const location = useLocation();
  const editState = location.state;
  const isEditMode = editState?.mode === "edit";
  const existing = editState?.post;

  const pinRef = useRef(null);         // 핀 아이콘 위치 참조
  const modalRef = useRef(null);       // 모달 감지용 참조

  // 폼 필드 참조
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const contentRef = useRef(null);
  const [recordImageList, setRecordImageList] = useState([]); // 업로드된 이미지 목록

  const alertShownRef = useRef(false);

  // 상태 관리
  const [trips, setTrips] = useState([]); // 여행 데이터
  const [invitedTrips, setInvitedTrips] = useState([]); // 내가 수락한 초대 여정

  const [selectedTripId, setSelectedTripId] = useState(existing?.trip_id || null); // 선택된 여행 ID
  const [selectedTripData, setSelectedTripData] = useState(null); //선택된 여행 데이터
  const [isTripModalOpen, setIsTripModalOpen] = useState(false); // 여행 선택 모달 열림 여부
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


  // mount 시 한번만
  useEffect(() => {
    if (!isEditMode) return;
    // 1) input 기본값 직접 세팅
    if (titleRef.current) titleRef.current.value = existing.title;
    if (subtitleRef.current) subtitleRef.current.value = existing.subtitle;
    if (contentRef.current) contentRef.current.value = existing.content;

    // 2) 이미지 URL 세팅
    setRecordImageList(existing.image_urls || []);

    // 3) selectedTripId 초기화
    setSelectedTripId(existing.trip_id);
  }, []);


  // 여행 리스트 불러오기
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/schedule/myTrips`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => {
        // 최신순 정렬
        const sorted = [...(data.trips || [])]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setTrips(sorted);
      })
      .catch(console.error);

    // 내가 수락한 초대 일정
    fetch('http://localhost:8080/trip/invitations/accepted', {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => {
        // { invitations: [ { trip_id, trip_title, start_date, end_date, destinations,... } ] }
        setInvitedTrips(data.invitations || []);
      })
      .catch(console.error);
  }, []);

  // 1) 여정 선택 시 days 로드 
  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`${process.env.REACT_APP_API_URL}/schedule/${selectedTripId}`, { credentials: 'include' })
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

  // 2) “합쳐진” 여정 리스트 만들기
  const allTrips = React.useMemo(() => {
    // 내가 만든 것
    const own = trips.map(t => ({
      ...t,
      type: 'CREATOR'
    }));

    // 초대한 사람: API 스펙에 맞춰 필드 이름 재가공
    const inv = invitedTrips.map(inv => ({
      trip_id: inv.trip_id,
      title: inv.trip_title,
      start_date: inv.start_date,
      end_date: inv.end_date,
      days: inv.days,
      type: 'INVITED',
      inviterNickname: inv.inviter_nickname,
      // …필요시 더 넣기
    }));

    // 중복 제거 후 병합
    const merged = [...own, ...inv];
    return merged.filter((t, i) =>
      merged.findIndex(x => x.trip_id === t.trip_id) === i
    );
  }, [trips, invitedTrips]);

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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/posts/upload`, {
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
      trip_id: selectedTripId,
      title: titleRef.current.value,
      content: subtitleRef.current.value
        ? `${subtitleRef.current.value}\n\n${contentRef.current.value}`
        : contentRef.current.value,
      image_urls: recordImageList,
      visibility: "PUBLIC",
    };

    const url = isEditMode
      ? `http://localhost:8080/posts/${existing.post_id}`  // 수정용 엔드포인트
      : "http://localhost:8080/posts";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch("http://localhost:8080/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // const data = await res.json();

      if (res.ok) {
        navigate(isEditMode ? `/gallery-detail/${existing.post_id}` : -1);
      } else {
        alert("업로드에 실패했습니다.");
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


              {allTrips.map(trip => (
                <div key={trip.trip_id} className="record-trip-item">
                  <div className="trip-info">
                    <strong>{trip.title}</strong>
                    {trip.type === 'INVITED' && (
                      <span className="inviter-label">
                        {trip.inviterNickname}
                      </span>
                    )}
                    <div>
                      {trip.start_date.split('T')[0]} - {trip.end_date.split('T')[0]}
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
              {allTrips.length === 0 && <p>선택 가능한 여정이 없습니다.</p>}




            </div>
            <button className="modal-close-btn" onClick={toggleTripModal}>
              닫기
            </button>
          </div>
        </div>
      )
      }

      {/* 여정 선택 뒤에만 DAY 탭과 지도 */}
      {
        selectedTripData && days.length > 0 && (
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
        )
      }

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
      {
        alertOpen && (
          <AlertModal text={alertText} onClose={() => setAlertOpen(false)} />
        )
      }

      {/* 하단 챗봇 컴포넌트 */}
      <ChatBot />

    </div >
  );
};

export default Record;