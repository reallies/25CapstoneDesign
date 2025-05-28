//Gallery.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Gallery.css';
import Placeholder from '../../assets/images/placeholder.png'; // 임시 이미지 경로
import ChatBot from "../components/ChatBot";

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

  // created_at 을 받아 상대 시간을 문자열로 리턴
  const formatTimeAgo = (isoDateString) => {
    const then = new Date(isoDateString).getTime();
    const now = Date.now();
    const diff = now - then; // ms

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}초 전`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    // 일주일 이상이면 그냥 날짜 표시
    return new Date(isoDateString).toLocaleDateString('ko-KR');
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

  // 정렬 함수 
  const sortRecords = (records) => {
    if (sortBy === '최근순') {
      return [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === '오래된 순') {
      return [...records].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return records; // '전체'는 원본 순서 유지
  };

  const allDisplay = sortRecords(allRecords);
  const friendDisplay = friendRecords;   // 친구 기록은 정렬 미적용 예시
  const myDisplay = myRecords;       // 내 기록은 원본 순서

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
        {myDisplay.map(post => (
          <div key={post.post_id} className="gallery-item" onClick={() => navigate(`/gallery-detail/${post.post_id}`)}>
            <img src={post.image_urls[0] || Placeholder} alt="" />
            <div>{post.title}</div>
          </div>
        ))}
      </div>

      {/* 친구의 여행기 */}
      <h2>친구의 여행기</h2>
      <div className="gallery-friend-posts">
        {friendDisplay.length === 0
          ? <div className="gallery-empty-msg">
            업데이트 된 친구의 새 글이 없습니다. <br />
            다양한 여행기를 통해 친구를 추가해보세요.
          </div>
          : friendDisplay.map(post => (
            <div key={post.post_id} className="gallery-post-content" onClick={() => navigate(`/gallery-detail/${post.post_id}`)}>
              <div className="gallery-head">
                <div className="friend-meta">
                  <img className="profile-circle" src={post.user.image_url} alt={post.user.nickname} />
                  <span className="friend-nickname">{post.user.nickname}</span>
                </div>
                <div className='gallery-post-title'>{post.title}</div>
                <p>{post.content.split(/\r?\n\r?\n/)[1].slice(0, 60)}</p>
              </div>
              <img className="gallery-thumb-box" src={post.image_urls[0] || Placeholder} alt='img' />
            </div>
          ))
        }
      </div>

      {/* 정렬 탭 */}
      < div className="gallery-tabs" >
        {
          SORT_OPTIONS.map((option) => (
            <button
              key={option}
              className={`gallery-sort-btn ${sortBy === option ? "active" : ""}`}
              onClick={() => setSortBy(option)}
            >
              {option}
            </button>
          ))
        }
      </div>

      {/* 전체 여행기 */}
      <h2>전체 여행기</h2>
      <div className="gallery-posts">
        {allDisplay.map(post => {

          const [subtitle, ...rest] = post.content.split(/\r?\n\r?\n/);
          const mainContent = rest.join("\n\n") || subtitle;

          const imgUrl =
            Array.isArray(post.image_urls) && post.image_urls[0]
              ? post.image_urls[0]
              : Placeholder;

          return (
            <div
              key={post.post_id}
              className="gallery-post-content"
              onClick={() => navigate(`/gallery-detail/${post.post_id}`)}
            >
              {/* ① 프로필 + 닉네임 영역 */}
              <div className='gallery-head'>
                <div className="friend-meta">
                  <img
                    className="profile-circle"
                    src={post.user.image_url}
                    alt={post.user.nickname}
                  />
                  <div>
                    <span className="friend-nickname">
                      {post.user.nickname}
                    </span>
                    <span className="post-time">
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>
                </div>

                <div className="gallery-post-text">
                  <div className="gallery-post-title">
                    {post.title || "제목 없음"}
                  </div>
                  <div className="gallery-post-desc">
                    {mainContent.length > 200
                      ? mainContent.slice(0, 200) + "…"
                      : mainContent}
                  </div>
                </div>
              </div>
              <div
                className="gallery-thumb-box"
                style={{ backgroundImage: `url(${imgUrl})` }}
              />
            </div>
          );
        })}
      </div>

      {/* 하단 챗봇 컴포넌트 */}
      <ChatBot />

    </div>

  );
};

export default Gallery;