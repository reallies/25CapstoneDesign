import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 쿠키에서 accessToken 확인
  const hasAccessToken = () => {
    const hasToken = document.cookie.includes("accessToken=");
    console.log("hasAccessToken 체크 - accessToken 존재:", hasToken);
    return hasToken;
  };

  // AccessToken 재발급 요청
  const refreshAccessToken = async () => {
    if (isRefreshing) {
      console.log("refreshAccessToken: 이미 재발급 진행 중");
      return false;
    }
    setIsRefreshing(true);

    try {
      console.log("refreshAccessToken 시작 - URL: http://localhost:8080/auth/refresh");
      const res = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      console.log("refreshAccessToken 응답 상태:", res.status);

      if (res.status === 403) {
        console.log("RefreshToken 만료됨, 로그인 필요");
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }
      console.log("refreshAccessToken 성공");
      return true;
    } catch (error) {
      console.error("refreshAccessToken 중 오류:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    try {
      console.log("checkLoginStatus 시작 - URL: http://localhost:8080/profile");
      const res = await fetch("http://localhost:8080/profile", {
        method: "GET",
        credentials: "include",
      });
      console.log("checkLoginStatus 응답 상태:", res.status);

      if (res.status === 401) {
        const hasToken = hasAccessToken();
        console.log("401 Unauthorized - accessToken 존재 여부:", hasToken);
        if (!hasToken) {
          console.log("자동 로그인 불가능, 로그인 필요");
          setIsLoggedIn(false);
          setUser(null);
          return;
        }

        // AccessToken 재발급 시도
        const refreshed = await refreshAccessToken();
        console.log("AccessToken 재발급 결과:", refreshed);
        if (!refreshed) {
          console.log("자동 로그인 실패, 로그인 필요");
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        return checkLoginStatus(); // 재발급 후 재시도
      }

      const data = await res.json();
      console.log("checkLoginStatus 성공 - 사용자 데이터:", data);
      setUser(data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("로그인 상태 확인 실패:", error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    if (isLoggedIn === null) {
      console.log("useEffect: 초기 로그인 상태 확인 시작");
      checkLoginStatus();
    }
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};