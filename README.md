# UZI (PhoneCom) - 스마트폰 가격 비교 플랫폼

UZI는 한국 시장의 스마트폰 가격을 비교하고 최적의 구매 옵션을 찾을 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 📱 스마트폰 가격 비교
- 다양한 브랜드와 모델의 가격 정보 제공
- 실시간 가격 업데이트
- 통신사별 요금제 비교

### 🗺️ 매장 위치 서비스
- 네이버 지도 API 연동
- 주변 스마트폰 매장 찾기
- 매장별 가격 정보 제공

### 🔐 사용자 인증
- 소셜 로그인 지원
- 개인화된 서비스 제공
- 찜 목록 및 비교 기록 관리

### 💰 최저가 찾기
- 전국 최저가 정보 제공
- 할인 혜택 및 이벤트 정보
- 가격 변동 알림

## 기술 스택

### Frontend (Client)
- **React.js** - 사용자 인터페이스
- **Tailwind CSS** - 스타일링
- **Naver Maps API** - 지도 서비스

### Backend (Server)
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **MySQL** - 데이터베이스
- **JWT** - 인증 토큰

## 프로젝트 구조

```
UZI/
├── client/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── contexts/      # React Context
│   │   ├── data/          # 정적 데이터
│   │   └── utils/         # 유틸리티 함수
│   └── public/
├── server/          # Node.js 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── services/      # 비즈니스 로직
│   │   ├── middleware/    # 미들웨어
│   │   └── db/           # 데이터베이스 설정
│   └── sql/             # SQL 스키마 파일
└── README.md
```

## 설치 및 실행

### 사전 요구사항
- Node.js 16+ 
- MySQL 8.0+
- npm 또는 yarn

### 백엔드 설정
```bash
cd server
npm install
npm run setup-db  # 데이터베이스 설정
npm start
```

### 프론트엔드 설정
```bash
cd client
npm install
npm start
```

## 환경 설정

### 백엔드 환경 변수 (.env)
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=uzi_db
JWT_SECRET=your_jwt_secret
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

## API 문서

### 인증 API
- `POST /api/auth/login` - 사용자 로그인
- `POST /api/auth/register` - 사용자 회원가입
- `GET /api/auth/social` - 소셜 로그인

### 기기 API
- `GET /api/models` - 스마트폰 모델 목록
- `GET /api/models/:id` - 특정 모델 정보

### 매장 API
- `GET /api/stores` - 매장 목록
- `GET /api/stores/nearby` - 주변 매장 찾기

### 가격 API
- `GET /api/deals` - 최신 딜 정보
- `GET /api/deals/lowest` - 최저가 정보

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 기여하기

프로젝트에 기여하고 싶으시다면 이슈를 등록하거나 풀 리퀘스트를 보내주세요.

## 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 통해 연락주세요.

