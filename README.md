# 🧭 Travel Scheduler & Recommender

### ⚔️ Team SLAY

> 맞춤형 여행 일정 추천 / 사용자 일정 관리 · 공유 플랫폼

![Thumbnail](docs/Thumbnail.png)

---

<<<<<<< HEAD
## Design
- **UI/UX 디자인:**  
  - Figma 디자인 참고: [Figma Design](https://www.figma.com/design/43bODe77hYu02GHCPcvaD1/2025-1-%EC%BA%A1%EC%8A%A4%ED%86%A4-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=0-1&t=JjS8VRgIPhXlqtoS-1)

## Npm(Node Package Module) Command
- **/backend : node server.js**  
  - express(node) 서버 가동
- **/root : npm start(nodemon)**  
  - React Webpack 서버(localhost:3000)와 express 서버(localhost:8080) 동시 가동, proxy를 통해 백엔드 api 연동 설정 완료
- **/root : npm run dev**  
  - React에서 정적 파일 서빙 후, express 서버에 연동, 배포 시 사용 커맨드

## Npm(Node Package Module) Command
- **개발환경**  
  - React => npm start를 통해 프론트엔드 환경에서 개발, proxy를 통해 백엔드 api 연동
- **배포환경**  
  - root => npm run dev를 통해 React 정적파일 serving 후 배포


**자세한 사항은 루트 디렉터리 아래에 package.json을 참고**  

  

=======
## 📌 프로젝트 개요

> **여행 준비, SLAY와 함께면 충분해요.** 

AI 여행지 추천부터 일정 · 지출 관리까지!  
복잡한 과정을 간단하게 만들어주는 여행 전용 웹 플랫폼 **SLAY**

---

## 📋 주요 기능 한눈에 보기

> 복잡한 앱 전전은 그만,  
> **더 간편하게, 더 똑똑하게, 더 즐겁게**  
> **SLAY**와 함께 가뿐한 여행을 시작하세요.

### ✔️ 핵심 기능

- 🧠 **AI 맞춤 추천**, 내 여행 성향에 꼭 맞는 장소 자동 추천
- 📆 **드래그 앤 드롭 일정 관리**, UI로 직관적인 여행 설계
- 🗺️ **지도 + 날씨 통합 제공**, 여행지 상황까지 한눈에
- 💸 **지출 관리와 후기 작성**, 여행의 기록을 더 가치 있게
- 🤝 **실시간 공동 편집**, 동행자와 함께 만드는 일정

---

## 🛠 기술 스택


### 🖥️ Front-End

- <img src="https://img.shields.io/badge/react-%2361DAFB.svg?&style=for-the-badge&logo=react&logoColor=black" align="left" />
- <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?&style=for-the-badge&logo=figma&logoColor=white" align="left" />

### ⚙️ Back-End

- <img src="https://img.shields.io/badge/node.js-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/visual%20studio%20code-%23007ACC.svg?&style=for-the-badge&logo=visual%20studio%20code&logoColor=white" align="left" />

### 🗄️ Database

- <img src="https://img.shields.io/badge/postgresql-%23336791.svg?&style=for-the-badge&logo=postgresql&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/prisma-%232D3748.svg?&style=for-the-badge&logo=prisma&logoColor=white" align="left" />

### 🌐 API & Integration

- <img src="https://img.shields.io/badge/kakao%20map-%23FFCD00.svg?&style=for-the-badge&logo=kakao&logoColor=black" align="left" />
- <img src="https://img.shields.io/badge/openweather-%23007396.svg?&style=for-the-badge&logo=openweather&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/openai-%23412991.svg?&style=for-the-badge&logo=openai&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/google%20calendar-%234285F4.svg?&style=for-the-badge&logo=google-calendar&logoColor=white" align="left" />

### 🔐 Authentication

- <img src="https://img.shields.io/badge/JWT-%23007ACC.svg?&style=for-the-badge&logo=jsonwebtokens&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/OAuth%202.0-%2326A69A.svg?&style=for-the-badge&logo=oauth&logoColor=white" align="left" />

### 🚀 Deployment

- <img src="https://img.shields.io/badge/amazon%20aws-%23232F3E.svg?&style=for-the-badge&logo=amazon-aws&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/nginx-%23269539.svg?&style=for-the-badge&logo=nginx&logoColor=white" align="left" />

### 🧩 Collaboration Tool

- <img src="https://img.shields.io/badge/github-%23181717.svg?&style=for-the-badge&logo=github&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/notion-%23000000.svg?&style=for-the-badge&logo=notion&logoColor=white" align="left" />
- <img src="https://img.shields.io/badge/kakaotalk-%23FFCD00.svg?&style=for-the-badge&logo=kakaotalk&logoColor=black" align="left" />
- <img src="https://img.shields.io/badge/discord-%237289DA.svg?&style=for-the-badge&logo=discord&logoColor=white" align="left" />

---

## 🎨 디자인

- [📎 Figma Design 바로가기](https://www.figma.com/design/43bODe77hYu02GHCPcvaD1/2025-1-%EC%BA%A1%EC%8A%A4%ED%86%A4-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=0-1&t=JjS8VRgIPhXlqtoS-1)

---

## 👥 팀 소개

| Profile                                                      | Name    | Role                                         | Contact                                                      |
| ------------------------------------------------------------ | ------- | -------------------------------------------- | ------------------------------------------------------------ |
| <img src="https://github.com/reallies.png" width="50" height="50"> | 👑오현석 | Backend Developer                            | gitHub: [@reallies](https://github.com/reallies)<br>Email: 0323eric@naver.com |
| <img src="https://github.com/mamemomif.png" width="50" height="50"> | 강연수  | UX/UI · Frontend / Developer                 | gitHub: [@mamemomif](https://github.com/mamemomif)<br>Email: yskang009@gmail.com |
| <img src="https://github.com/hyeonn9.png" width="50" height="50"> | 구정현  | Backend Developer / Database Manager         | gitHub: [@hyeonn9](https://github.com/hyeonn9)<br>Email: 1319ono@gmail.com |
| <img src="https://github.com/gihwan1112.png" width="50" height="50"> | 김기환  | External API Integrator / Deployment Manager | gitHub: [@gihwan1112](https://github.com/gihwan1112)<br>Email: gihwan494@gmail.com |

---

> 👏 **"여행을 준비하는 모든 순간, SLAY가 함께합니다."**
>>>>>>> origin/develop/frontend
