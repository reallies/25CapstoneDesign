import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Record.css';
import PlaceMap from '../components/PlaceMap'; // 지도 컴포넌트
import KakaoMap from '../components/RecordKakaoMap'; // 카카오 맵 컴포넌트

// 아이콘 이미지 import
import photoIcon from '../../assets/images/camera.svg';
import pinIcon from '../../assets/images/pin.svg';
import back from '../../assets/images/back.svg';
import search2 from '../../assets/images/search2.svg';

const Record = () => {
  const navigate = useNavigate();
  const pinRef = useRef(null);         // 핀 아이콘 위치 참조
  const modalRef = useRef(null);       // 모달 감지용 참조

  // 현재 시간 포맷팅 (예: "2025. 05. 19 PM 09:03")
  const now = new Date();
  const hour12 = now.getHours() % 12 || 12;
  const ampm = now.getHours() < 12 ? 'AM' : 'PM';
  const pad2 = num => String(num).padStart(2, '0');
  const formattedTime =
    `${now.getFullYear()}. ${pad2(now.getMonth() + 1)}. ${pad2(now.getDate())} ` +
    `${ampm} ${pad2(hour12)}:${pad2(now.getMinutes())}`;


  // 폼 필드 참조
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const contentRef = useRef(null);

  // 상태 관리
  const { user } = useContext(AuthContext); //유저 데이터
  const [trips, setTrips] = useState(null); // 여행 데이터
  const [selectedTripId, setSelectedTripId] = useState(null); // 선택된 여행 ID
  const [selectedTripData, setSelectedTripData] = useState(null); //선택된 여행 데이터
  const [isTripModalOpen, setIsTripModalOpen] = useState(false); // 여행 선택 모달 열림 여부
  const [recordImageList, setRecordImageList] = useState([]); // 업로드된 이미지 목록
  const [isModalOpen, setIsModalOpen] = useState(false);      // 모달 열림 여부
  const [searchText, setSearchText] = useState('');           // 검색 입력 텍스트
  const [isFocused, setIsFocused] = useState(false);          // 검색창 포커스 상태
  const [days, setDays] = useState([]);                     // day 데이터 상태
  const [activeDay, setActiveDay] = useState('ALL'); // 전체 or 인덱스



  // 검색 결과와 선택된 장소 상태
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);


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
        setSearchText('');
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  // 여행 리스트 불러오기
  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
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

  // 검색어가 바뀔 때마다 디바운스 후 장소 검색
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(searchPlaces, 200, searchText);
    return () => clearTimeout(timer);
  }, [searchText]);

  // 카카오 로컬 API 호출 함수
  const searchPlaces = async (keyword) => {
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await res.json();
      setSearchResults(data.documents || []);
    } catch (err) {
      console.error('장소 검색 오류:', err);
    }
  };

  // 1) 여정 선택 후 days 로드 (기존 fetch)
  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`http://localhost:8080/schedule/${selectedTripId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setDays(data.trip.days))
      .catch(console.error);
  }, [selectedTripId]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !pinRef.current.contains(e.target)
      ) {
        setIsModalOpen(false);
        setSearchText('');
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const filteredDays =
    activeDay === 'ALL'
      ? days
      : [days[activeDay]];

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);    // place 객체 전체 저장
    setSearchText(place.place_name);
    setIsModalOpen(false);
  };

  // 여정 선택 핸들러
  const handleTripSelect = (trip) => {
    setSelectedTripId(trip.trip_id);
    setSelectedTripData(trip);
    setIsTripModalOpen(false);
  };

  // 이미지 업로드 핸들러
  const handleRecordImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setRecordImageList(prev => [...prev, ...imagePreviews]);
  };

  // 모달 토글
  const handleToggleModal = () => {
    setIsModalOpen(prev => !prev);
    setSearchText('');
    setIsFocused(false);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchText('');
    setIsFocused(false);
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
      alert("여행을 선택해주세요.");
      return;
    }

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 백엔드가 받도록 하는 payload
    const payload = {
      trip_id,
      title,
      content: subtitle
        ? `${subtitle}\n\n${content}`      // 부제목과 본문 합치기
        : content,
      visibility: "PUBLIC",                  // 필요에 따라 선택지도 추가
      image_urls: recordImageList,           // 현재는 preview URL 배열
      // rating:    0                         // 평점 UI가 있으면 추가
    };

    console.log("업로드할 데이터:", payload);

    try {
      const res = await fetch("http://localhost:8080/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",              // JWT 쿠키 인증 필요 시
        body: JSON.stringify(payload),
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

  return (
    <div className="record-container">
      {/* 제목 입력 */}
      <input
        ref={titleRef}
        type="text"
        className="record-title"
        defaultValue="제목"
        onFocus={(e) => {
          if (e.target.value === "제목") e.target.value = "";
        }}
      />

      {/* 부제목 입력 */}
      <input
        ref={subtitleRef}
        type="text"
        className="record-subtitle"
        defaultValue="부제목을 입력해주세요"
        onFocus={(e) => {
          if (e.target.value === "부제목을 입력해주세요") e.target.value = "";
        }}
      />

      {/* 작성자 정보 및 버튼 영역 */}
      <div className="record-meta">
        <img className="profile-circle" src={user?.image_url || photoIcon} alt='프로필' />
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

          {/* 장소 선택 핀 버튼 및 모달 */}
          <div className="pin-wrapper" ref={pinRef}>
            <img
              src={pinIcon}
              alt=""
              className="record-icon"
              onClick={handleToggleModal}
            />
            {isModalOpen && (
              <div className="record-modal-popup">
                <div
                  className="record-modal"
                  ref={modalRef}
                >
                  {/* 모달 헤더 */}
                  <div className="record-modal-header">
                    <img
                      src={back}
                      alt="뒤로가기"
                      className="record-back"
                      onClick={handleCloseModal}
                    />
                    <div className="record-search-container">
                      <input
                        type="text"
                        className="record-modal-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={isFocused ? '' : '장소 검색'}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                          if (searchText === '') setIsFocused(false);
                        }}
                      />
                      <img src={search2} alt="돋보기" className="record-search-icon" />
                    </div>
                  </div>

                  {/* 장소 리스트 */}
                  <div className="record-place-list">
                    {searchResults.map((place) => (
                      <div key={place.id} className="record-place-item">
                        <div className="record-place-thumb">
                          {/* 카카오 썸네일 */}
                          <img src={place.place_url || photoIcon} alt="" />
                        </div>
                        <div className="record-place-info">
                          <div className="record-place-name">{place.place_name}</div>
                          <div className="record-place-location">{place.address_name}</div>
                        </div>
                        <button
                          className="record-select-btn"
                          onClick={() => handlePlaceSelect(place)}
                        >
                          선택
                        </button>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchText.trim() && (
                      <div className="no-results">검색 결과가 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
      {/* 선택된 장소가 있으면 지도 렌더링 */}
      {
        selectedPlace && (
          <PlaceMap selectedPlace={selectedPlace} />
        )
      }

      {/* 메인 글쓰기 텍스트 영역 */}
      <textarea
        ref={contentRef}
        className="record-placeholder"
        defaultValue="나만의 여행을 기록해주세요!"
        onFocus={(e) => {
          if (e.target.value === "나만의 여행을 기록해주세요!") e.target.value = "";
        }}
      />

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

            {/* 추가적인 글쓰기 영역 (사진 아래) */}
            <textarea
              className="record-placeholder"
              defaultValue="기록을 이어가고 싶다면 작성해주세요!"
              onFocus={(e) => {
                if (e.target.value === "기록을 이어가고 싶다면 작성해주세요!") e.target.value = "";
              }}
            />
          </>
        )
      }
    </div >
  );
};

export default Record;