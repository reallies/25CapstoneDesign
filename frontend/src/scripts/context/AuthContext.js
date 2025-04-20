import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [user, setUser] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 쿠키에서 accessToken 확인
    const hasAccessToken = () => {
        return document.cookie.includes("accessToken=");
    };

    // AccessToken 재발급 요청
    const refreshAccessToken = async () => {
        if (isRefreshing) return false;
        setIsRefreshing(true);

        try {
            const res = await fetch("http://localhost:8080/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (res.status === 403) {
                console.log("RefreshToken 만료됨, 로그인 필요");
                setIsLoggedIn(false);
                setUser(null);
                return false;
            }
            return true;
        } catch (error) {
            console.error("refreshAccessToken 중 오류", error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    };

    // 로그인 상태 확인
    const checkLoginStatus = async () => {
        try {
            const res = await fetch("http://localhost:8080/profile", {
                method: "GET",
                credentials: "include",
            });

            if (res.status === 401) {
                if (!hasAccessToken()) {
                    console.log("자동 로그인 불가능, 로그인 필요");
                    setIsLoggedIn(false);
                    setUser(null);
                    return;
                }

                // AccessToken 재발급 시도
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    console.log("자동 로그인 실패, 로그인 필요");
                    setIsLoggedIn(false);
                    setUser(null);
                    return;
                }
                return checkLoginStatus();
            }

            const data = await res.json();
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
            checkLoginStatus();
        }
    }, [isLoggedIn]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, setIsLoggedIn, setUser,checkLoginStatus }}>
            {children}
        </AuthContext.Provider>
    );
};