# PhoneCom Server

Node.js(Express) + MySQL(Cloud SQL) API 서버

## 개발 준비

1) 의존성 설치

```bash
cd server
npm i
```

2) 환경변수 설정

```bash
copy .env.example .env # Windows
```

`.env` 값을 Cloud SQL 접속 정보로 채워주세요.

3) 스키마/시드 실행

```bash
npm run db:seed
```

4) 서버 실행

```bash
npm run dev
# http://localhost:4000/api/v1/health
```

## 폴더 구조

```
server/
  src/
    app.js
    db/
      index.js
    routes/
      index.js
      health.routes.js
      models.routes.js
      deals.routes.js
      stores.routes.js
      reviews.routes.js
    services/
      model.service.js
      deal.service.js
      store.service.js
      review.service.js
    utils/
      response.js
      validators.js
  sql/
    001_schema.sql
    002_seed.sql
  scripts/
    seed.js
```

## API 요약

- GET `/api/v1/health`
- GET `/api/v1/models?brand=galaxy|iphone`
- GET `/api/v1/models/:slug`
- GET `/api/v1/deals?model_slug=...&storage=128GB&seller_type=all|online|offline|official`
- GET `/api/v1/deals/top?limit=10&seller_type=...`
- GET `/api/v1/stores/nearby?lat=&lng=&radius=&minPrice=&maxPrice=&minRating=&openNow=`
- GET `/api/v1/reviews?store_id=2`
- POST `/api/v1/reviews` { store_id, rating, comment }


