# 인증 시스템 설정 가이드

## 환경변수 설정

서버 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=PPS_APP
DB_PORT=3306

# JWT 시크릿 키 (반드시 변경하세요)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# 서버 포트
PORT=4000

# 관리자 이메일 (쉼표로 구분)
ADMIN_EMAILS=admin@example.com,super@example.com

# 네이버 로그인 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/auth/callback/naver

# 카카오 로그인 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/callback/kakao
```

## 네이버 로그인 설정

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. "애플리케이션 등록"으로 새 앱 생성
3. 서비스 URL: `http://localhost:3000` (개발환경)
4. Callback URL: `http://localhost:3000/auth/callback/naver`
5. 사용 API: 네이버 로그인
6. 제공정보: 이메일 주소, 닉네임, 프로필 사진 선택
7. 발급받은 Client ID와 Client Secret을 `.env`에 설정

## 카카오 로그인 설정

1. [카카오 개발자 사이트](https://developers.kakao.com/)에 접속
2. "내 애플리케이션"에서 앱 생성
3. "플랫폼" > "Web" 추가
   - 사이트 도메인: `http://localhost:3000`
4. "카카오 로그인" > "Redirect URI" 설정
   - `http://localhost:3000/auth/callback/kakao`
5. "카카오 로그인" > "동의항목" 설정
   - 카카오계정(이메일), 프로필 정보(닉네임, 프로필 사진) 필수 동의
6. "앱 키" > "REST API 키"를 `.env`의 `KAKAO_CLIENT_ID`에 설정
7. 필요시 Client Secret도 설정

## 데이터베이스 초기화

```bash
# 스키마 생성
npm run db:setup

# 시드 데이터 삽입
npm run db:seed
```

## 서버 실행

```bash
npm run dev
```

## 클라이언트 환경변수 설정

클라이언트 루트 디렉토리에 `.env` 파일 생성:

```env
REACT_APP_API_URL=http://localhost:4000/api/v1
```

## API 엔드포인트

### 인증 관련
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `GET /api/v1/auth/me` - 사용자 정보 조회

### 소셜 로그인
- `GET /api/v1/auth/social/naver/redirect` - 네이버 로그인 시작
- `GET /api/v1/auth/social/kakao/redirect` - 카카오 로그인 시작
- `POST /api/v1/auth/social/naver` - 네이버 로그인 처리
- `POST /api/v1/auth/social/kakao` - 카카오 로그인 처리

## 권한 시스템

### 페이지별 접근 권한
- **홈, 전국 최저가, 총비용 확인**: 누구나 접근 가능
- **우리동네**: 로그인 필요
- **마이페이지**: 로그인 필요

### 미들웨어
- `authenticateToken`: JWT 토큰 검증
- `requireAuth`: 로그인 필수
- `requireLocationAccess`: 위치 기반 서비스 접근 권한
- `requireEmailVerified`: 이메일 인증 필수
- `requireAdmin`: 관리자 권한 필요

## 보안 기능

1. **비밀번호 해싱**: bcryptjs (12 rounds)
2. **JWT 토큰**: Access Token + Refresh Token 방식
3. **세션 관리**: 데이터베이스 기반 세션 관리
4. **Rate Limiting**: API 호출 속도 제한
5. **CORS 설정**: 허용된 도메인만 접근
6. **보안 헤더**: Helmet.js 적용
7. **입력 검증**: express-validator 사용

## 문제 해결

### 소셜 로그인이 작동하지 않는 경우
1. 환경변수 설정 확인
2. 리다이렉트 URI 정확성 확인
3. 브라우저 팝업 차단 해제
4. HTTPS 환경에서 테스트 (프로덕션)

### 토큰 관련 오류
1. JWT_SECRET 설정 확인
2. 토큰 만료 시간 확인
3. 브라우저 로컬스토리지/쿠키 확인

### 데이터베이스 연결 오류
1. 데이터베이스 서비스 실행 상태 확인
2. 연결 정보 (호스트, 포트, 사용자명, 비밀번호) 확인
3. 데이터베이스 존재 여부 확인
