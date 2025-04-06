import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./scripts/components/NavigationBar";
import Home from "./scripts/pages/Home";
import Login from "./scripts/pages/Login";
import Schedule from "./scripts/pages/Schedule";
import Expenses from "./scripts/pages/Expenses";

const App = () => {
  return (
    <Router>
      <NavigationBar /> {/* 네비게이션 바 포함 */}
      <Routes>
        <Route path="/" element={<Home />} /> {/* 메인 페이지 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/schedules" element={<Schedule />} /> {/* 일정 만들기 페이지 */}
        <Route path="/expenses" element={<Expenses />} /> {/* 가계부 페이지 */}
      </Routes>
    </Router>
  );
};

export default App;