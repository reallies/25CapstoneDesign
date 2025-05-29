import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { //로그인 안되어 있으면 로그인 페이지로 이동
    if (!isLoggedIn) {
      if (window.location.pathname !== "/") {
        navigate("/login");
      }
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = async () => { //로그아웃
    await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div>
      {isLoggedIn && user ? (
        <div>
          <h2>사용자 프로필</h2>
          <img src={user.image_url} alt="프로필 이미지" style={{ width: "100px", borderRadius: "50%" }}/>
          <p>닉네임: {user.nickname}</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <h2>로그인 중</h2>
      )}
    </div>
  );
};

export default Profile;