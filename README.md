# 25CapstoneDesign
25년 1학기 캡스톤디자인

# Travel Scheduler & Recommender

## 프로젝트 개요
이 프로젝트는 사용자가 여행 일정을 요일별로 계획할 수 있도록 지원하며, 지도, 날씨, 경비, 후기 등 여행에 필요한 정보를 한 곳에서 제공하는 웹 서비스입니다.  
또한, AI 기반 챗봇 기능을 통해 사용자가 설정한 시나리오(지역, 동행자 유형, 여행 성향 등)에 맞춰 맞춤 여행지를 추천하고, 생성된 여행 일정을 구글 캘린더에 연동하는 기능을 포함합니다.

## 주요 기능
- **회원가입/로그인:** 구글 소셜 로그인 활용
- **여행 일정 관리:** 여행 일정 생성, 수정, 삭제 및 Day별 관리 (드래그 앤 드롭 인터페이스)
- **지도 연동:** KakaoMap API를 이용한 지도 및 스트리트 뷰 표시
- **날씨 정보:** 기상청 API를 활용한 예보 확인
- **AI 기반 챗봇 추천:** Open AI API를 이용한 맞춤 여행지 추천
- **구글 캘린더 연동:** 생성된 일정 자동 등록
- **경비 관리 및 여행 후기:** 지출 기록 및 후기 작성 기능

## 기술 스택
- **Front-end:**  
  - 프레임워크: React  
  - 디자인 도구: Pigma
- **Back-end:**  
  - 플랫폼: Node.js  
  - 개발 환경: VSCode
- **데이터베이스:**  
  - DBMS: PostgreSQL  
  - ORM: Prisma
- **외부 API:**  
  - 지도/스트리트 뷰: KakaoMap API  
  - 날씨: 기상청 API  
  - AI 기능: Open AI API  
  - 캘린더 연동: Google Calendar API
  - 로그인: OAuth 2.0 api
- **인증:** Google 소셜 로그인
- **배포:**  
  - 서버: AWS EC2  
  - 웹서버: Nginx (리버스 프록시 및 정적 파일 서빙)
- **프로젝트 관리 및 커뮤니케이션:**  
  - 버전 관리: GitHub  
  - 소통: KakaoTalk, Discord  
  - 회의록: Notion

## Design
- **UI/UX 디자인:**  
  - Figma 디자인 참고: [Figma Design](https://www.figma.com/design/43bODe77hYu02GHCPcvaD1/2025-1-%EC%BA%A1%EC%8A%A4%ED%86%A4-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=0-1&t=JjS8VRgIPhXlqtoS-1)
