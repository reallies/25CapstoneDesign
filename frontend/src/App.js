import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./scripts/components/NavigationBar";
import { AuthProvider } from "./scripts/context/AuthContext";
import Home from "./scripts/pages/Home";
import Login from "./scripts/pages/Login";
import Profile from "./scripts/pages/Profile";
import SetNickname from "./scripts/components/SetNickname";
import Schedule from "./scripts/pages/Schedule";
import MyTrip from "./scripts/pages/MyTrips";

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
          <Route path="/my-trips" element={<MyTrip />} /> {/* 사용자 여행 페이지 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;