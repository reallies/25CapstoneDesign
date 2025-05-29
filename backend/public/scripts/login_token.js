// function saveToken(accessToken) {
//   localStorage.setItem("accessToken", accessToken);
//   updateUI(true);
// }

// function updateUI(isLoggedIn) {
//   document.getElementById("login-buttons").style.display = isLoggedIn ? "none" : "block";
//   document.getElementById("action-buttons").style.display = isLoggedIn ? "block" : "none";
//   document.getElementById("login-status").textContent = isLoggedIn ? "로그인 상태: 로그인됨" : "로그인 상태: 로그아웃됨";
// }

// function checkLoginStatus() {
//   updateUI(!!localStorage.getItem("accessToken"));
// }

// function refreshToken(callback) {
//   fetch("http://localhost:8080/refresh", { method: "POST", credentials: "include" })
//     .then(res => {
//       if (!res.ok) throw new Error("Refresh 실패");
//       return res.json();
//     })
//     .then(data => {
//       if (data.accessToken) {
//         saveToken(data.accessToken);
//         if (callback) callback();
//       }
//     })
//     .catch(error => {
//       console.error("Refresh 오류:", error);
//       localStorage.removeItem("accessToken");
//       updateUI(false);
//       alert("세션이 만료되었습니다. 다시 로그인해주세요.");
//     });
// }

// function fetchProfile() {
//   const token = localStorage.getItem("accessToken");
//   if (!token) return alert("먼저 로그인하세요.");

//   fetch("http://localhost:8080/profile", { headers: { Authorization: "Bearer " + token } })
//     .then(res => {
//       if (res.status === 401) return refreshToken(fetchProfile);
//       if (!res.ok) throw new Error("프로필 조회 실패");
//       return res.json();
//     })
//     .then(data => {
//       const profileDiv = document.getElementById("profile-info");
//       profileDiv.style.display = "block";
//       profileDiv.innerHTML = `<h2>프로필 정보</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
//     })
//     .catch(error => alert(error.message));
// }

// function logout() {
//   fetch("http://localhost:8080/logout", { method: "GET", credentials: "include" })
//     .then(res => res.json())
//     .then(() => {
//       localStorage.removeItem("accessToken");
//       updateUI(false);
//       alert("로그아웃 되었습니다.");
//     })
//     .catch(error => alert("로그아웃 오류: " + error.message));
// }