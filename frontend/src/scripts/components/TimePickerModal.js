import React, { useState, useRef, useEffect, useMemo } from 'react';
import './TimePickerModal.css';

// 방문 시간 선택 모달 컴포넌트
const TimePickerModal = ({ onClose, onConfirm, initialTime }) => {
    // 선택 가능한 값 정의
    const periods = useMemo(() => ['오전', '오후'], []);
    const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')), []);
    const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')), []);

    // 초기 선택 상태 설정
    const [period, setPeriod] = useState(initialTime?.period || '오전');
    const [hour, setHour] = useState(initialTime?.hour || '01');
    const [minute, setMinute] = useState(initialTime?.minute || '00');

    // 각 스크롤 영역 참조
    const periodRef = useRef(null);
    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    const ITEM_HEIGHT = 40; // 항목 높이 기준값

    // 스크롤 위치를 가장 가까운 항목으로 맞추는 함수
    const snapScroll = (ref, items, setFunc) => {
    if (!ref.current) return;
    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    ref.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    if (items[index]) setFunc(items[index]);
  };

  // 스크롤 종료 시 snapScroll을 적용하는 효과
  const useSnapEffect = (ref, items, setFunc) => {
    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      let timeout;
      const handleScroll = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => snapScroll(ref, items, setFunc), 100);
      };
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }, [ref, items, setFunc]);
  };

  // 마우스 휠로 항목 이동
  const useWheelControl = (ref) => {
    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY);
        el.scrollTop += delta * ITEM_HEIGHT;
      };
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }, [ref]);
  };

  // 각 스크롤 영역에 snap 효과와 wheel 제어 적용
  useSnapEffect(periodRef, periods, setPeriod);
  useSnapEffect(hourRef, hours, setHour);
  useSnapEffect(minuteRef, minutes, setMinute);
  useWheelControl(periodRef);
  useWheelControl(hourRef);
  useWheelControl(minuteRef);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // 초기 스크롤 위치 설정 (이전 값 복원)
  useEffect(() => {
    const scrollToValue = (ref, list, value) => {
      const index = list.indexOf(value);
      if (index !== -1) {
        ref.current.scrollTop = index * ITEM_HEIGHT;
      }
    };
    if (periodRef.current) scrollToValue(periodRef, periods, period);
    if (hourRef.current) scrollToValue(hourRef, hours, hour);
    if (minuteRef.current) scrollToValue(minuteRef, minutes, minute);
}, [period, hour, minute, periods, hours, minutes]);

  // 모달 UI 렌더링
  return (
    <div className="time-modal-overlay" onClick={onClose}>
      <div className="time-modal" onClick={(e) => e.stopPropagation()}>
        <h4 className="time-title">방문 시간 선택</h4>

        <div className="scroll-picker-wrap">
          <div className="scroll-picker" ref={periodRef}>
            <div className="picker-item empty" />
            {periods.map((p) => (
              <div key={p} className="picker-item">{p}</div>
            ))}
            <div className="picker-item empty" />
          </div>

          <div className="scroll-picker" ref={hourRef}>
            <div className="picker-item empty" />
            {hours.map((h) => (
              <div key={h} className="picker-item">{h}</div>
            ))}
            <div className="picker-item empty" />
          </div>

          <div className="colon">:</div>

          <div className="scroll-picker" ref={minuteRef}>
            <div className="picker-item empty" />
            {minutes.map((m) => (
              <div key={m} className="picker-item">{m}</div>
            ))}
            <div className="picker-item empty" />
          </div>

          <div className="highlight-bar" />
        </div>

        <button
          className="confirm-button"
          onClick={() => onConfirm(`${period} ${hour}:${minute}`)}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default TimePickerModal;
