//App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./scripts/components/NavigationBar";
import { AuthProvider } from "./scripts/context/AuthContext";
import Home from "./scripts/pages/Home";
import Login from "./scripts/pages/Login";
import Profile from "./scripts/pages/Profile";
import SetNickname from "./scripts/pages/SetNickname";
import Schedule from "./scripts/pages/Schedule";
import MySchedule from "./scripts/pages/MySchedule";
import MyPage from "./scripts/pages/MyPage";
import Expenses from "./scripts/pages/Expenses";
import Gallery from './scripts/pages/Gallery';
import Record from './scripts/pages/Record';
import GalleryDetail from "./scripts/pages/GalleryDetail";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar /> {/* 네비게이션 바 포함 */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* 메인 페이지 */}
          <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
          <Route path="/profile" element={<Profile  />} /> {/* 프로필 페이지 */}
          <Route path="/set-nickname" element={<SetNickname />} /> {/* 닉네임 설정 페이지 */}
          <Route path="/schedule/:trip_id" element={<Schedule />} /> {/* 여행 생성,수정,삭제 페이지 */}
          <Route path="/myschedule" element={<MySchedule />} /> {/* 나의 일정 페이지 */}
          <Route path="/mypage" element={<MyPage />} /> {/* 마이페이지 */}
          <Route path="/expenses/:trip_id" element={<Expenses />} />{/* 가계부 */}
          <Route path="/gallery" element={<Gallery />} /> {/* 여행갤러리 */}
          <Route path="/record" element={<Record />} /> {/* 기록 쓰기 */}
          <Route path="/gallery-detail/:post_id" element={<GalleryDetail />} />  {/* 여행갤러리 세부페이지 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;