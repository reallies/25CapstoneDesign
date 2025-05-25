import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Gallery.css';

const Gallery = () => {
  const navigate = useNavigate();

  // 정렬 상태 
  const SORT_OPTIONS = ['전체', '최근순', '오래된 순'];
  const [sortBy, setSortBy] = useState('전체');

  // 내 기록, 친구 기록, 전체 기록 상태
  const [myRecords, setMyRecords] = useState([]);
  const [friendRecords, setFriendRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);

  // 친구 ID 목록을 가져오는 헬퍼 함수 
  const getMyFriendIds = async () => {
    const res = await fetch("http://localhost:8080/friendship/list", {
      credentials: "include",
    });
    if (!res.ok) {
      console.error("친구 목록 불러오기 실패:", res.statusText);
      return [];
    }
    const { friends } = await res.json(); // [{ user_id, ... }, ...]
    return friends.map(f => f.user_id);
  };

  // 3) 마운트 시 한 번에 모든 데이터 불러오기
  useEffect(() => {
    // 내 기록
    fetch("http://localhost:8080/posts/me", { credentials: "include" })
      .then(r => r.json())
      .then(({ posts }) => setMyRecords(posts))
      .catch(console.error);

    // 전체 공개 기록 (갤러리)
    fetch("http://localhost:8080/posts/gallery", { credentials: "include" })
      .then(r => r.json())
      .then(({ posts }) => setAllRecords(posts))
      .catch(console.error);

    // 친구 기록: 친구 리스트 부르고, 그 ID만 필터
    getMyFriendIds()
      .then(friendIds =>
        fetch("http://localhost:8080/posts/gallery", { credentials: "include" })
          .then(r => r.json())
          .then(({ posts }) => {
            const filtered = posts.filter(p => friendIds.includes(p.user_id));
            setFriendRecords(filtered);
          })
      )
      .catch(console.error);
  }, []);

  // --- 4) 정렬 함수 ---
  const sortRecords = (records) => {
    if (sortBy === '최근순') {
      return [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === '오래된 순') {
      return [...records].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return records; // '전체'는 원본 순서 유지
  };

  // 섹션별로 정렬 적용
  const mySorted = sortRecords(myRecords);
  const friendSorted = sortRecords(friendRecords);
  const allSorted = sortRecords(allRecords);



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

      {/* 내 기록 */}
      <h2 className="gallery-section-title">내 기록</h2>
      <div className="gallery-my-records">
        {myRecords.map(post => (
          <div key={post.post_id} className="gallery-item">
            <img src={post.image_urls[0] || '/placeholder.png'} alt="" />
            <div>{post.title}</div>
          </div>
        ))}
      </div>

      {/* 친구의 여행기 */}
      <h2>친구의 여행기</h2>
      <div className="gallery-friend-posts">
        {friendRecords.map(post => (
          <div key={post.post_id} className="gallery-item">
            <img src={post.image_urls[0] || '/placeholder.png'} alt="" />
            <h3>{post.title}</h3>
            <p>{post.content.slice(0, 60)}...</p>
          </div>
        ))}
      </div>

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

      {/* 전체 여행기 */}
      <h2>전체 여행기</h2>
      <div className="gallery-post-content">
        {allRecords.map(post => (
          <div key={post.post_id} className="gallery-item">
            <img src={post.image_urls[0] || '/placeholder.png'} alt="" />
            <h3>{post.title}</h3>
            <p>{post.content.slice(0, 60)}...</p>
          </div>
        ))}
      </div>



    </div>
  );
};

export default Gallery;
