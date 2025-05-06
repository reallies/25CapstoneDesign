import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GalleryDetail.css';
import locateIcon from '../../assets/images/locate.svg';
import mapImage from '../../assets/images/map.svg';

const MyGalleryDetail = () => {
const navigate = useNavigate();

// 일정 보기 / 게시글 보기 토글 상태
const [showSchedule, setShowSchedule] = useState(false);

// 선택된 일정 탭 (전체 / DAY1 / DAY2 / DAY3)
const [activeDay, setActiveDay] = useState('ALL');

// 일정/게시글 뷰 토글 함수
const toggleView = () => {
setShowSchedule(prev => !prev);
};

// 일정 데이터
const scheduleData = [
{
    date: '| 25.03.12 수',
    color: 'red',
    items: ['전주 중앙 공원', '전주 수목원', '전주 한옥 호텔']
},
{
    date: '| 25.03.13 목',
    color: 'green',
    items: ['전주 한옥 호텔', '전주 수목원', '전주 한옥 호텔']
},
{
    date: '| 25.03.14 금',
    color: 'purple',
    items: ['전주 한옥 호텔', '전주 수목원', '전주 한옥 레일바이크']
}
];

// 탭 필터링된 일정 정보
const filteredDays = activeDay === 'ALL'
? scheduleData.map((d, i) => ({
    ...d,
    items: d.items.map(name => ({ name }))
    }))
: [scheduleData[parseInt(activeDay.replace('DAY', '')) - 1]].map(d => ({
    ...d,
    items: d.items.map(name => ({ name }))
    }));

return (
<div className="detail-container">
    <div className="edit-delete-top-right">
    <span className="edit-text">수정</span> | <span className="delete-text">삭제</span>
    </div>
    {/* 제목 및 설명 */}
    <h2 className="detail-title">전북 여행</h2>
    <p className="detail-desc">
    오랜만에 다녀온 전북 여행! 전주의 익산, 군산까지 정말 알차게 다녀온 2박 3일이었어요.
    감성 가득한 여행 사진과 함께 기록을 남깁니다.
    </p>

    {/* 작성자 정보 및 버튼 */}
    <div className="detail-meta">
    <div className="profile-circle" />
    <div className="meta-text">
        <span className="nickname">
        상상부기
        </span>
        <br />
        <span className="time">2025. 03. 17 PM 04:25</span>
    </div>
    <div className="meta-buttons">
        <button className="meta-btn follow" onClick={toggleView}>
        {showSchedule ? '게시글 보기' : '일정 보기'}
        </button>
        <button
        className="meta-btn view-schedule"
        onClick={() => navigate("/gallery")}
        >
        여행갤러리 홈
        </button>
    </div>
    </div>

    <hr className="divider" />

    {/* 일정 보기 화면 */}
    {showSchedule ? (
    <>
        {/* 일정 탭 */}
        <div className="gallery-tabs">
        <button
            className={`gallery-tab ${activeDay === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveDay('ALL')}
        >
            전체 보기
        </button>
        <button
            className={`gallery-tab ${activeDay === 'DAY1' ? 'active' : ''}`}
            onClick={() => setActiveDay('DAY1')}
        >
            DAY 1
        </button>
        <button
            className={`gallery-tab ${activeDay === 'DAY2' ? 'active' : ''}`}
            onClick={() => setActiveDay('DAY2')}
        >
            DAY 2
        </button>
        <button
            className={`gallery-tab ${activeDay === 'DAY3' ? 'active' : ''}`}
            onClick={() => setActiveDay('DAY3')}
        >
            DAY 3
        </button>
        </div>

        {/* 일정 리스트 + 지도 */}
        <div className="gallery-schedule">
        <div className="gallery-schedule-list">
            {filteredDays.map((day, dayIdx) => (
            <div key={dayIdx} className="day-card">
                <div className="day-header">
                <div className="day-title">DAY {dayIdx + 1}</div>
                <div className="day-date">{day.date}</div>
                </div>
                <ul className="schedule-ul">
                {day.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="schedule-item">
                    <span
                        className="item-number"
                        style={{
                        backgroundColor:
                            dayIdx === 0
                            ? '#F39F9F'
                            : dayIdx === 1
                            ? '#A8E6CE'
                            : '#C3B1E1'
                        }}
                    >
                        {itemIdx + 1}
                    </span>
                    <span className="item-name">{item.name}</span>
                    </li>
                ))}
                </ul>
            </div>
            ))}
        </div>
        <img src={mapImage} alt="map" className="schedule-map" />
        </div>
    </>
    ) : (
    <>
        {/* 게시글 뷰 (사진 + 설명) */}
        <div className="photo-section">
        <img src="https://placehold.co/600x350" alt="1" className="photo-img" />
        <div className="photo-location">
            <img src={locateIcon} alt="locate" className="location-icon" /> 전주 한옥마을 역사관
        </div>
        <div className="gallery-detail-content">
            <p>오랜만에 찾은 전북, 익숙하면서도 새로운 시간이었어요. 전주에서는 한옥마을의 고즈넉한 분위기와 함께 걷는 재미를 느꼈어요.</p>
        </div>
        </div>

        <div className="photo-section">
        <img src="https://placehold.co/600x350" alt="2" className="photo-img" />
        <div className="photo-location">
            <img src={locateIcon} alt="locate" className="location-icon" /> 전주 한옥마을
        </div>
        <div className="gallery-detail-content">
            <p>전주의 따뜻한 햇살과 고소한 길거리 음식과 고요한 골목의 풍경. 짧은 시간이었지만 도시마다 다른 전통의 깊이 느껴졌던 여행이었습니다. 다시 한번 방문하고 싶은 전북, 그 감동을 사진에 담아봅니다.</p>
        </div>
        </div>
    </>
    )}
</div>
);
};

export default MyGalleryDetail;

