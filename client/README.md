# 우지(UZI) - 휴대폰 가격 비교 웹앱

대한민국 20-30대 사용자를 위한 직관적이고 투명한 휴대폰 가격 비교 서비스입니다.

## 🚀 주요 기능

- **브랜드 선택**: 갤럭시와 아이폰 중 선택
- **모델 비교**: 다양한 모델의 스펙과 가격 비교
- **가격 추천**: 가격순으로 최적의 구매 옵션 추천
- **판매처 비교**: 온라인, 오프라인, 공식몰 가격 비교
- **반응형 디자인**: 모바일 우선 설계

## 🛠️ 기술 스택

- **Frontend**: React 18, React Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Create React App

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

### 3. 프로덕션 빌드
```bash
npm run build
```

## 🎯 사용 시나리오

### 1. 홈페이지
- 갤럭시 또는 아이폰 브랜드 선택
- 각 브랜드의 특징과 장점 소개

### 2. 브랜드별 모델 선택
- 선택한 브랜드의 모든 모델 표시
- 시리즈별, 가격대별 필터링
- 그리드/리스트 뷰 전환

### 3. 가격 비교
- 선택한 모델의 저장용량, 색상 선택
- 판매처별 가격 비교 (가격순 정렬)
- 온라인/오프라인/공식몰 필터링
- 최저가 하이라이트

## 📱 주요 페이지

- `/` - 홈페이지 (브랜드 선택)
- `/:brand` - 브랜드별 모델 선택 (galaxy, iphone)
- `/compare/:modelId` - 가격 비교 페이지

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: #3B82F6 (Blue-500)
- **Accent**: #F59E0B (Amber-500)
- **Success**: #10B981 (Emerald-500)
- **Text**: #1E293B (Slate-800)
- **Background**: #F8FAFC (Slate-50)

### 반응형 브레이크포인트
- Mobile: 320px ~ 768px
- Tablet: 768px ~ 1024px
- Desktop: 1024px 이상

## 📊 데이터 구조

### 휴대폰 모델
```javascript
{
  id: 'galaxy-s25',
  name: 'Galaxy S25',
  brand: 'Samsung',
  series: 'Galaxy S',
  specs: {
    display: '6.2인치',
    camera: '50MP',
    battery: '4000mAh'
  },
  variants: [
    {
      storage: '256GB',
      colors: ['black', 'white', 'blue'],
      officialPrice: 1250000
    }
  ]
}
```

### 가격 정보
```javascript
{
  seller: {
    name: '온라인몰A',
    type: 'online',
    rating: 4.5
  },
  price: 1050000,
  originalPrice: 1150000,
  discount: 100000,
  conditions: ['무이자 할부', '당일 출고']
}
```

## 🔧 개발 가이드

### 컴포넌트 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Header.js       # 헤더 컴포넌트
│   └── PriceCard.js    # 가격 카드 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── HomePage.js     # 홈페이지
│   ├── BrandSelectionPage.js  # 브랜드 선택 페이지
│   └── PriceComparisonPage.js # 가격 비교 페이지
├── data/               # 데이터 파일
│   └── phoneData.js    # 휴대폰 모델 및 가격 데이터
├── utils/              # 유틸리티 함수
│   └── helpers.js      # 포맷팅 및 헬퍼 함수
└── App.js              # 메인 앱 컴포넌트
```

### 스타일링 가이드
- Tailwind CSS 클래스 사용
- 컴포넌트별 커스텀 클래스 정의
- 반응형 디자인 우선 적용

## 🚀 배포

### Vercel 배포 (권장)
1. GitHub 저장소에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 자동 배포 설정

### Netlify 배포
1. `npm run build` 실행
2. `build` 폴더를 Netlify에 업로드

## 📝 향후 개선 사항

- [ ] 실제 API 연동
- [ ] 사용자 인증 기능
- [ ] 가격 알림 기능
- [ ] 위치 기반 매장 검색
- [ ] PWA 기능 추가
- [ ] 다크 모드 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**우지(UZI)** - 스마트한 휴대폰 구매를 위한 가격 비교 플랫폼