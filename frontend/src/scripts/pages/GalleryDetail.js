// GalleryDetail.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import './GalleryDetail.css';
import DetailKakaoMap from '../components/DetailKakaoMap.js';

export default function GalleryDetail() {
    const { post_id } = useParams();

    const { user: me } = useContext(AuthContext);

    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [activeDay, setActiveDay] = useState('ALL');


    useEffect(() => {
        fetch(`http://localhost:8080/posts/${post_id}/detail`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setPost(data.post))
            .catch(console.error);
    }, [post_id]);

    if (!post) {
        return (
            <div className="loading-container">
                <h3>로딩 중…</h3>
            </div>
        );
    }
    const days = post.trip?.days || [];
    const isMine = post.user.user_id === me.user_id;


    const filteredDays =
        activeDay === "ALL"
            ? days
            : days.filter(d => d.day_order === Number(activeDay.replace("DAY", "")));


    // “몇 시간/일 전” 포맷팅
    const formatTimeAgo = (iso) => {
        const diff = (Date.now() - new Date(iso)) / 1000;
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    };

    const handleEdit = () => {
        navigate("/record", {
            state: {
                mode: "edit",
                post: {
                    post_id: post.post_id,
                    trip_id: post.trip_id,
                    title: post.title,
                    subtitle: post.content.split(/\r?\n\r?\n/)[0],
                    content: post.content.split(/\r?\n\r?\n/)[1] || "",
                    image_urls: post.image_urls,
                    visibility: post.visibility,
                }
            }
        });
    };

    const handleDelete = async () => {
        const res = await fetch(`http://localhost:8080/posts/${post.post_id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (res.ok) {
            navigate("/gallery");
        } else {
            alert("게시글 삭제에 실패했습니다.");
        }
    };

    return (
        <div className="detail-container">
            {/* ─── 메타 정보 ─── */}
            <h2 className="detail-title">{post.title}</h2>
            <p className="detail-desc">{post.content.split(/\r?\n\r?\n/)[0]}</p>

            <div className="detail-meta">
                <img
                    className="profile-circle"
                    src={post.user.image_url}
                    alt={post.user.nickname}
                />
                <div className="meta-text">
                    <span className="nickname">
                        {post.user.nickname}

                    </span>
                    <br />
                    <span className="post-time">
                        {formatTimeAgo(post.created_at)}
                    </span>
                </div>
                <div className="meta-buttons">
                    <button className="meta-btn follow" onClick={() => setShowSchedule(s => !s)}>
                        {showSchedule ? "게시글 보기" : "일정 보기"}
                    </button>
                    <button className="meta-btn home" onClick={() => navigate("/gallery")}>
                        갤러리 홈
                    </button>
                </div>
            </div>

            <hr className="divider" />

            {/* ─── 일정 보기 ─── */}
            {showSchedule ? (
                <>
                    <div className="gallery-tabs">
                        <button
                            className={`gallery-tab ${activeDay === 'ALL' ? 'active' : ''}`}
                            onClick={() => setActiveDay('ALL')}
                        >전체 보기</button>
                        {days.map(d => (
                            <button
                                key={d.day_id}
                                className={`gallery-tab ${activeDay === `DAY${d.day_order}` ? 'active' : ''}`}
                                onClick={() => setActiveDay(`DAY${d.day_order}`)}
                            >DAY {d.day_order}</button>
                        ))}
                    </div>

                    <div className="gallery-schedule">
                        <div className="gallery-schedule-list">
                            {filteredDays.map(day => (
                                <div key={day.day_id} className="day-card">
                                    <div className="day-header">
                                        <div className="day-title">DAY {day.day_order}</div>
                                        <div className="day-date">| {day.date}</div>
                                    </div>
                                    <ul className="schedule-ul">
                                        {day.places.map((p, i) => (
                                            <li key={p.dayplace_id} className="schedule-item">
                                                <span
                                                    className="item-number"
                                                    style={{
                                                        backgroundColor:
                                                            day.day_order === 1 ? "#F39F9F" :
                                                                day.day_order === 2 ? "#A8E6CE" : "#C3B1E1"
                                                    }}
                                                >{i + 1}</span>
                                                <span className="item-name">{p.place.place_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {/* 일정 리스트 + 실제 카카오맵 */}
                        <div className="schedule-map">
                            <DetailKakaoMap days={filteredDays} />
                        </div>
                    </div>
                </>
            ) : (
                /* ─── 사진+본문 보기 ─── */
                post.image_urls.map((url, idx) => (
                    <div key={idx} className="photo-section">
                        <img src={url} alt={`photo-${idx}`} className="photo-img" />
                        <div className="gallery-detail-content">
                            <p>{post.content.split(/\r?\n\r?\n/)[1]}</p>
                        </div>
                    </div>
                ))
            )}
            {isMine && (
                <div className="meta-buttons">
                    <button className="meta-btn edit" onClick={handleEdit}>
                        수정하기
                    </button>
                    <button
                        className="meta-btn delete"
                        onClick={() => {
                            if (window.confirm("정말 삭제하시겠습니까?")) {
                                handleDelete();
                            }
                        }}
                    >
                        삭제하기
                    </button>
                </div>
            )}
        </div>
    );
}
