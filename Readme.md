# 2025년 1학기 캡스톤디자인
# Team SLAY

# Travel Scheduler & Recommender

## 프로젝트 개요
이 프로젝트는 사용자가 여행 일정을 요일별로 계획할 수 있도록 지원하며, 지도, 날씨, 경비, 후기 등 여행에 필요한 정보를 한 곳에서 제공하는 웹 서비스입니다.  
또한, AI 기반 챗봇 기능을 통해 사용자가 설정한 시나리오(지역, 동행자 유형, 여행 성향 등)에 맞춰 맞춤 여행지를 추천하고, 생성된 여행 일정을 구글 캘린더에 연동하는 기능을 포함합니다.

## 주요 기능
- **회원가입/로그인:** <img src="https://img.shields.io/badge/google-%234285F4.svg?&style=for-the-badge&logo=google&logoColor=white" /><img src="https://img.shields.io/badge/naver-%2303C75A.svg?&style=for-the-badge&logo=naver&logoColor=white" /><img src="https://img.shields.io/badge/kakao-%23FFCD00.svg?&style=for-the-badge&logo=kakao&logoColor=black" /> 소셜 로그인 활용 / JWT 인증 방식
- **여행 일정 관리:** 여행 일정 생성, 수정, 삭제 및 Day별 관리 (드래그 앤 드롭 인터페이스)
- **지도 연동:** KakaoMap API를 이용한 지도 및 스트리트 뷰 표시
- **날씨 정보:** OpenWeather API를 활용한 예보 확인
- **AI 기반 챗봇 추천:** <img src="https://img.shields.io/badge/openai-%23412991.svg?&style=for-the-badge&logo=openai&logoColor=white" /> API를 이용한 맞춤 여행지 추천
- **구글 캘린더 연동:** 생성된 일정 자동 등록
- **경비 관리 및 여행 후기:** 지출 기록 및 후기 작성 기능

## 기술 스택
- **Front-end:**  
  - 프레임워크: <img src="https://img.shields.io/badge/react-%2361DAFB.svg?&style=for-the-badge&logo=react&logoColor=black" />
  - 디자인 도구: <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?&style=for-the-badge&logo=figma&logoColor=white" />
- **Back-end:**  
  - 플랫폼: <img src="https://img.shields.io/badge/node.js-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" />
  - 개발 환경: <img src="https://img.shields.io/badge/visual%20studio%20code-%23007ACC.svg?&style=for-the-badge&logo=visual%20studio%20code&logoColor=white" />
- **데이터베이스:**  
  - DBMS: <img src="https://img.shields.io/badge/postgresql-%23336791.svg?&style=for-the-badge&logo=postgresql&logoColor=white" />  
  - ORM: <img src="https://img.shields.io/badge/prisma-%232D3748.svg?&style=for-the-badge&logo=prisma&logoColor=white" />
- **외부 API:**  
  - 지도/스트리트 뷰: <img src="https://img.shields.io/badge/kakao-%23FFCD00.svg?&style=for-the-badge&logo=kakao&logoColor=black" /> Map API  
  - 날씨: OpenWeather
  - AI 기능: <img src="https://img.shields.io/badge/openai-%23412991.svg?&style=for-the-badge&logo=openai&logoColor=white" /> 
  - 캘린더 연동: <img src="https://img.shields.io/badge/google%20calendar-%234285F4.svg?&style=for-the-badge&logo=google%20calendar&logoColor=white" />
  - 로그인: OAuth 2.0 api
- **인증:** JWT
- **배포:**  
  - 서버: <img src="https://img.shields.io/badge/amazon%20aws-%23232F3E.svg?&style=for-the-badge&logo=amazon%20aws&logoColor=white" />EC2
  - 웹서버: <img src="https://img.shields.io/badge/nginx-%23269539.svg?&style=for-the-badge&logo=nginx&logoColor=white" /> (리버스 프록시 및 정적 파일 서빙)
- **프로젝트 관리 및 커뮤니케이션:**  
  - 버전 관리: <img src="https://img.shields.io/badge/github-%23181717.svg?&style=for-the-badge&logo=github&logoColor=white" /> 
  - 소통: <img src="https://img.shields.io/badge/kakaotalk-%23FFCD00.svg?&style=for-the-badge&logo=kakaotalk&logoColor=black" /><img src="https://img.shields.io/badge/discord-%237289DA.svg?&style=for-the-badge&logo=discord&logoColor=white" />  
  - 회의록: <img src="https://img.shields.io/badge/notion-%23000000.svg?&style=for-the-badge&logo=notion&logoColor=white" />

## Design
- **UI/UX 디자인:**  
  - <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?&style=for-the-badge&logo=figma&logoColor=white" />