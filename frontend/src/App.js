import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./scripts/components/NavigationBar";
import Home from "./scripts/pages/Home";
import Login from "./scripts/pages/Login";
import Schedule from "./scripts/pages/Schedule";
import Expenses from "./scripts/pages/Expenses";
import SetNickname from "./scripts/pages/SetNickname";
import MySchedule from "./scripts/pages/MySchedule";
import MyPage from "./scripts/pages/MyPage";
import Gallery from './scripts/pages/Gallery';
import Record from './scripts/pages/Record';
import GalleryDetail from "./scripts/pages/GalleryDetail";

const App = () => {
  return (
    <Router>
      <NavigationBar /> {/* 네비게이션 바 포함 */}
      <Routes>
        <Route path="/" element={<Home />} /> {/* 메인 페이지 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/schedules" element={<Schedule />} /> {/* 일정 만들기 페이지 */}
        <Route path="/expenses" element={<Expenses />} /> {/* 가계부 페이지 */}
        <Route path="/set-nickname" element={<SetNickname />} />  {/* 닉네임 설정 페이지 */}
        <Route path="/myschedule" element={<MySchedule />} /> {/* 나의 일정 페이지 */}
        <Route path="/mypage" element={<MyPage />} /> {/* 마이페이지 */}
        <Route path="/gallery" element={<Gallery />} /> {/* 여행갤러리 */}
        <Route path="/record" element={<Record />} /> {/* 기록 쓰기 */}
        <Route path="/gallery-detail" element={<GalleryDetail />} />  {/* 여행갤러리 세부페이지 */}
      </Routes>
    </Router>
  );
};

export default App;