import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();

  // 정렬 탭의 현재 선택된 항목 상태
  const [galleryActiveSort, setGalleryActiveSort] = useState("전체");

  // 친구 추가 버튼 상태 (각 인덱스별로 '친구 추가' 또는 '대기중' 상태)
  const [galleryFriendRequest, setGalleryFriendRequest] = useState([false, false, false]);

  // 정렬 옵션 목록
  const gallerySortOptions = ["전체", "인기순", "최근순", "오래된 순"];

  // 친구 추가 버튼 클릭 시 상태 토글
  const toggleGalleryFriendRequest = (index) => {
    setGalleryFriendRequest(prevState => {
      const updated = [...prevState];
      updated[index] = !updated[index];
      return updated;
    });
  };

  return (
    <div className="gallery-wrapper">
      
      {/* 페이지 상단: 제목과 '기록 쓰기' 버튼 */}
      <div className="gallery-header">
        <h1>여행 갤러리</h1>
        <button className="gallery-record-btn" onClick={() => navigate("/record")}>기록 쓰기</button>
      </div>

      {/* 내 기록 섹션 */}
      <h2 className="gallery-section-title">내 기록</h2>
      <div className="gallery-my-records">
        {[0, 1, 2, 3, 4].map((_, index) => (
          <div key={index} className={`gallery-thumbnail ${index === 0 ? 'active' : ''}`}>
            <div className="gallery-thumb-img" />
            <div className="gallery-thumb-caption">
              {['전북 여행', '대나무가 가득한 울산', '홍천의 자연을 한 몸에', '부산의 바다에서', '가평과의 만남'][index]}
            </div>
          </div>
        ))}
      </div>

      {/* 친구의 여행기 섹션 */}
      <h2 className="gallery-section-title">친구의 여행기</h2>

      {/* 친구의 새 글이 없을 경우 안내 메시지 */}
      <div className="gallery-empty-msg">
        업데이트 된 친구의 새 글이 없습니다. <br />
        다양한 여행기를 통해 친구를 추가해보세요.
      </div>

      {/* 정렬 탭 */}
      <div className="gallery-tabs">
        {gallerySortOptions.map((option) => (
          <button
            key={option}
            className={`gallery-sort-btn ${galleryActiveSort === option ? "active" : ""}`}
            onClick={() => setGalleryActiveSort(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 친구 여행기 리스트 */}
      <div className="gallery-friend-posts">
        {[0, 1, 2].map((_, index) => (
          <div className="gallery-post-row" key={index}>

            {/* 프로필 및 친구 추가 버튼 */}
            <div className="gallery-post-meta">
              <div className="gallery-profile-circle" />
              <div className="gallery-meta-text">
                <span className="gallery-nickname">
                  상상부기
                  <span
                    className={`gallery-friend-link ${galleryFriendRequest[index] ? "pending" : ""}`}
                    onClick={() => toggleGalleryFriendRequest(index)}
                  >
                    · {galleryFriendRequest[index] ? "대기중" : "친구 추가"}
                  </span>
                </span><br />
                <span className="gallery-time">{['23시간전', '1일전', '2일전'][index]}</span>
              </div>
            </div>

            {/* 여행기 내용 */}
            <div
              className="gallery-post-content"
              onClick={() => navigate("/gallery-detail")}
            >
              <div className="gallery-post-text">
                <div className="gallery-post-title">
                  {['홍천의 자연을 한 몸에', '부산의 바다에서', '가평과의 만남'][index]}
                </div>
                <div className="gallery-post-desc">
                  {[
                    '청정한 자연 덕분에 뛰어난 경관을 가진 명소가 많은 홍천. 알파카 월드에서 여러 동물과 만나며 여행을 시작한다. 점심은 가리산 근처 맛집에서 배를 든든하게 채우고 오후에는 레저 스포츠를 즐긴다. 울창한 녹음 사이에서 짚라인 또는 서바이벌을 하며 스트레스를 날려보자.',
                    '에메랄드빛 바다와 어우러진 포토 스팟이 부산 곳곳에서 반긴다. 걷는 내내 카메라를 손에서 놓을 수 없는 흰여울 문화 마을과 바닥까지 투명해 아찔함까지 선물하는 송도 해상 케이블 카는 꼭 경험해보자. 저녁은 부산 여행에서 빼놓을 수 있는 시장 투어!',
                    '가평의 대표 명소를 만나는 코스. 쁘띠프랑스의 마리오네트 공연과 레일바이크, 야경 감상까지 가평의 대표 즐길 거리가 함께 한다. 이후 숙소에서 바비큐까지 구워 먹는 것으로 하루를 마무리하면 좋다.'
                  ][index]}
                </div>
              </div>
              <div className="gallery-thumb-box" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
