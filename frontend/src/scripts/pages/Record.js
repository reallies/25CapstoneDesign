import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Record.css';

// 아이콘 이미지 import
import photoIcon from '../../assets/images/camera.svg';
import pinIcon from '../../assets/images/pin.svg';
import back from '../../assets/images/back.svg';
import search2 from '../../assets/images/search2.svg';

const Record = () => {
  const navigate = useNavigate();
  const pinRef = useRef(null);         // 핀 아이콘 위치 참조
  const modalRef = useRef(null);       // 모달 감지용 참조

  // 상태 관리
  const [recordImageList, setRecordImageList] = useState([]); // 업로드된 이미지 목록
  const [isModalOpen, setIsModalOpen] = useState(false);      // 모달 열림 여부
  const [searchText, setSearchText] = useState('');           // 검색 입력 텍스트
  const [isFocused, setIsFocused] = useState(false);          // 검색창 포커스 상태

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

  return (
    <div className="record-container">
      {/* 제목 입력 */}
      <input
        type="text"
        className="record-title"
        defaultValue="제목"
        onFocus={(e) => {
          if (e.target.value === "제목") e.target.value = "";
        }}
      />

      {/* 부제목 입력 */}
      <input
        type="text"
        className="record-subtitle"
        defaultValue="부제목을 입력해주세요"
        onFocus={(e) => {
          if (e.target.value === "부제목을 입력해주세요") e.target.value = "";
        }}
      />

      {/* 작성자 정보 및 버튼 영역 */}
      <div className="record-meta">
        <div className="profile-circle" />
        <div className="record-meta-text">
          <span className="record-nickname">상상부기</span>
          <div className="record-time">2025. 03. 17 PM 04:25</div>
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
                    {[
                      '전주 한옥마을',
                      '전주향교',
                      '국립무형유산원',
                      '전동성당',
                      '전주 중앙 공원',
                      '전주 수목원',
                    ].map((place, idx) => (
                      <div key={idx} className="record-place-item">
                        <div className="record-place-thumb" />
                        <div className="record-place-info">
                          <div className="record-place-name">{place}</div>
                          <div className="record-place-location">전주</div>
                        </div>
                        <button className="record-select-btn">선택</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 올리기/취소 버튼 */}
          <button className="record-submit">올리기</button>
          <button className="record-cancel" onClick={() => navigate(-1)}>취소</button>
        </div>
      </div>

      <hr className="record-divider" />

      {/* 메인 글쓰기 텍스트 영역 */}
      <textarea
        className="record-placeholder"
        defaultValue="나만의 여행을 기록해주세요!"
        onFocus={(e) => {
          if (e.target.value === "나만의 여행을 기록해주세요!") e.target.value = "";
        }}
      />

      {/* 이미지 추가 시 미리보기와 추가 입력창 표시 */}
      {recordImageList.length > 0 && (
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
      )}
    </div>
  );
};

export default Record;