import React from "react";
import "./FeedbackModal.css";
import icon from "../../assets/images/icon.svg";
import { useEffect, useState } from "react";

// 지도 대신 화면 오른쪽에 피드백 내용을 띄움
const FeedbackModal = ({ onClose, tripId }) => {
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const feedback = async () => {
            try {
                const res = await fetch(`http://localhost:8080/feedback/${tripId}`);
                const data = await res.json();
                setFeedbacks(data.feedbacks);
            } catch (error) {
                console.error("피드백 불러오기 오류");
            } finally {
                setLoading(false);
            }
        };
        feedback();
    }, [tripId]);

    return (
        // 모달 전체 영역 (바깥 클릭 시 onClose 실행)
        <div className="feedback-modal" onClick={onClose}>
            {/* 모달 내부 영역 (바깥 클릭 방지) */}
            <div className="feedback-box" onClick={(e) => e.stopPropagation()}>
                {/* 모달 상단 - 프로필 사진, 제목, 시간 표시 */}
                <div className="feedback-header">
                    <img src={icon} alt="profile" className="feedback-profile" />
                    <div className="feedback-title">slay support</div>
                </div>

                {loading ? (
                    <>
                        <div className="feedback-message">
                            <p className="check-title">✨ 일정 체크 중!</p>
                            <p className="check-desc">
                                AI가 당신의 여행 일정을 분석하고 있어요! 조금만 기다려주세요.<br />
                            </p>
                        </div>
                        {/* Skeleton UI 3개 정도 보여주기 */}
                        <div className="skeleton"></div>
                        <div className="skeleton"></div>
                        <div className="skeleton"></div>
                    </>
                ) : (
                    <div className="feedback-message">
                        <p className="check-title">✨ 일정 체크 완료!</p>
                        <p className="check-desc">
                            여행 일정, 한 번 더 꼼꼼히 확인해드릴게요!<br />
                            <strong>slay support</strong>가 당신의 계획을 똑똑하게 점검해드립니다!
                        </p>
                    </div>
                )}

                {feedbacks.map((item) => (
                    <div key={item.day} className="feedback-bubble">
                        <p className="bubble-label">💬 DAY {item.day} 일정 피드백이에요!</p>

                        {typeof item.feedback === "string" ? (
                            <p>{item.feedback}</p>
                        ) : (
                            <>
                                <div className="feedback-block">
                                    <p className="feedback-label">🗺️ 동선 피드백</p>
                                    <p className="feedback-content">{item.feedback?.distance_feedback}</p>
                                </div>
                                <hr />
                                <div className="feedback-block">
                                    <p className="feedback-label">🔭 날씨 피드백</p>
                                    {item.feedback.weather_info?.some((rw) =>
                                        rw.summary.main?.includes("작년")
                                    ) && (
                                        <p
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "#777",
                                                marginBottom: "0.9rem",
                                                marginTop: "-0.1rem",
                                            }}
                                        >
                                            ※ 날씨 예보는 현재 날짜의 8일만 주어집니다. 작년 날씨 데이터를 제공할게요.
                                        </p>
                                    )}
                                    {Array.isArray(item.feedback.weather_info) &&
                                        item.feedback.weather_info.map((regionWeather, idx) => (
                                            <div key={idx} className="feedback-content">
                                                {/* 장소들 + 지역명 */}
                                                <p>
                                                    📍 <b>{regionWeather.places.join(", ")} ({regionWeather.region})</b>
                                                </p>
                                                {/* 날씨 요약 */}
                                                {regionWeather.summary.main?.includes("작년") ? (
                                                    <p>
                                                        <b>최고 온도: {regionWeather.summary.maxTemp}</b> ｜
                                                        <b style={{ marginLeft: "8px" }}>
                                                            최저 온도: {regionWeather.summary.minTemp}
                                                        </b>{" "}
                                                        ｜
                                                        <b style={{ marginLeft: "8px" }}>
                                                            평균 습도: {regionWeather.summary.humidity}
                                                        </b>
                                                    </p>
                                                ) : (
                                                    <p>
                                                        <b>{regionWeather.summary.main}</b> ｜
                                                        <b style={{ marginLeft: "8px" }}>
                                                            최고 온도: {regionWeather.summary.maxTemp}
                                                        </b>{" "}
                                                        ｜
                                                        <b style={{ marginLeft: "8px" }}>
                                                            최저 온도: {regionWeather.summary.minTemp}
                                                        </b>
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    {item.feedback.weather_feedback && (
                                        <p style={{ marginTop: "1rem" }}>
                                            👉 {item.feedback.weather_feedback}
                                        </p>
                                    )}
                                </div>
                                <hr />
                                <div className="feedback-block">
                                    <p className="feedback-label">⏰ 운영시간 피드백</p>
                                    <p className="feedback-content">{item.feedback.operating_hours_feedback}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackModal;