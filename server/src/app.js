'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const authService = require('./services/auth.service');

const app = express();

// 보안 관련 미들웨어
app.use(helmet({
  crossOriginEmbedderPolicy: false // React 개발 서버와의 호환성을 위해
}));

// 전체 API 속도 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 최대 1000회 요청
  message: {
    success: false,
    message: '너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000']; // 개발 환경 기본값

console.log('CORS origins:', corsOrigin); // 디버깅용 로그

app.use(cors({ 
  origin: corsOrigin, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } });
});

// 만료된 세션 정리 (1시간마다 실행)
setInterval(() => {
  authService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log('환경변수 확인:');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '미설정');
  console.log('- NAVER_CLIENT_ID:', process.env.NAVER_CLIENT_ID ? '설정됨' : '미설정');
  console.log('- KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID ? '설정됨' : '미설정');
});


