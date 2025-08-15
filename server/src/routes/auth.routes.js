const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const socialService = require('../services/social.service');
const { errorResponse } = require('../utils/response');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// 로그인 시도 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입 시도 제한
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3회 시도
  message: {
    success: false,
    message: '너무 많은 회원가입 시도가 있었습니다. 1시간 후 다시 시도해주세요.',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 입력 검증 규칙
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.'),
  body('nickname')
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2-20자 사이여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9_]+$/)
    .withMessage('닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('phoneNumber')
    .optional()
    .matches(/^010-\d{4}-\d{4}$/)
    .withMessage('올바른 휴대폰 번호 형식이 아닙니다. (010-0000-0000)'),
  body('userType')
    .isIn(['BUYER', 'SELLER'])
    .withMessage('사용자 유형은 BUYER 또는 SELLER여야 합니다.'),
  body('agreeTerms')
    .equals('true')
    .withMessage('이용약관에 동의해야 합니다.'),
  body('agreePrivacy')
    .equals('true')
    .withMessage('개인정보처리방침에 동의해야 합니다.')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
];

// 검증 오류 처리 미들웨어
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json(errorResponse(errorMessages.join(', '), 400));
  }
  next();
};

// 회원가입
router.post('/register', registerLimiter, registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(result.success ? 201 : result.code).json(result);
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다.', 500));
  }
});

// 로그인
router.post('/login', loginLimiter, loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = req.headers['user-agent'] || null;
    
    console.log('Login attempt for email:', email); // 디버깅용 로그
    
    const result = await authService.login(email, password, deviceInfo);
    
    console.log('Login result:', result); // 디버깅용 로그
    
    if (result.success) {
      // HTTP-only 쿠키로 refresh token 설정
      res.cookie('refreshToken', result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });
    }
    
    res.status(result.success ? 200 : result.code).json(result);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다.', 500));
  }
});

// 네이버 로그인
router.post('/social/naver', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code || !state) {
      return res.status(400).json(errorResponse('인증 코드가 필요합니다.', 400));
    }
    
    // 네이버 액세스 토큰 발급
    const accessToken = await socialService.getNaverAccessToken(code, state);
    
    // 네이버 사용자 정보 조회
    const userInfo = await socialService.getNaverUserInfo(accessToken);
    
    // 소셜 로그인 처리
    const deviceInfo = req.headers['user-agent'] || null;
    const result = await authService.socialLogin('NAVER', userInfo, deviceInfo);
    
    if (result.success) {
      // HTTP-only 쿠키로 refresh token 설정
      res.cookie('refreshToken', result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });
    }
    
    res.status(result.success ? 200 : result.code).json(result);
  } catch (error) {
    console.error('Naver login route error:', error);
    res.status(500).json(errorResponse('네이버 로그인 중 오류가 발생했습니다.', 500));
  }
});

// 카카오 로그인
router.post('/social/kakao', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json(errorResponse('인증 코드가 필요합니다.', 400));
    }
    
    // 카카오 액세스 토큰 발급
    const accessToken = await socialService.getKakaoAccessToken(code);
    
    // 카카오 사용자 정보 조회
    const userInfo = await socialService.getKakaoUserInfo(accessToken);
    
    // 소셜 로그인 처리
    const deviceInfo = req.headers['user-agent'] || null;
    const result = await authService.socialLogin('KAKAO', userInfo, deviceInfo);
    
    if (result.success) {
      // HTTP-only 쿠키로 refresh token 설정
      res.cookie('refreshToken', result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });
    }
    
    res.status(result.success ? 200 : result.code).json(result);
  } catch (error) {
    console.error('Kakao login route error:', error);
    res.status(500).json(errorResponse('카카오 로그인 중 오류가 발생했습니다.', 500));
  }
});

// 토큰 갱신
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json(errorResponse('Refresh token이 필요합니다.', 401));
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    if (result.success) {
      // 새로운 refresh token으로 쿠키 업데이트
      res.cookie('refreshToken', result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });
    }
    
    res.status(result.success ? 200 : result.code).json(result);
  } catch (error) {
    console.error('Token refresh route error:', error);
    res.status(500).json(errorResponse('토큰 갱신 중 오류가 발생했습니다.', 500));
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    // 쿠키 삭제
    res.clearCookie('refreshToken');
    
    res.json({ success: true, message: '로그아웃되었습니다.' });
  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json(errorResponse('로그아웃 중 오류가 발생했습니다.', 500));
  }
});

// 모든 기기에서 로그아웃 (인증 필요)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.user_id; // 인증 미들웨어에서 설정됨
    
    if (!userId) {
      return res.status(401).json(errorResponse('로그인이 필요합니다.', 401));
    }
    
    await authService.logoutAll(userId);
    
    // 쿠키 삭제
    res.clearCookie('refreshToken');
    
    res.json({ success: true, message: '모든 기기에서 로그아웃되었습니다.' });
  } catch (error) {
    console.error('Logout all route error:', error);
    res.status(500).json(errorResponse('로그아웃 중 오류가 발생했습니다.', 500));
  }
});

// 사용자 정보 조회 (인증 필요)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return res.status(401).json(errorResponse('로그인이 필요합니다.', 401));
    }
    
    const [user] = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json(errorResponse('사용자를 찾을 수 없습니다.', 404));
    }
    
    res.json({
      success: true,
      message: '사용자 정보 조회 성공',
      data: { user }
    });
  } catch (error) {
    console.error('Get user info route error:', error);
    res.status(500).json(errorResponse('사용자 정보 조회 중 오류가 발생했습니다.', 500));
  }
});

// 사용자 정보 업데이트 (인증 필요)
const updateUserValidation = [
  body('nickname')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2-20자 사이여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9_]+$/)
    .withMessage('닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('phoneNumber')
    .optional()
    .matches(/^010-\d{4}-\d{4}$/)
    .withMessage('올바른 휴대폰 번호 형식이 아닙니다. (010-0000-0000)'),
  body('userType')
    .optional()
    .isIn(['BUYER', 'SELLER'])
    .withMessage('사용자 유형은 BUYER 또는 SELLER여야 합니다.')
];

router.put('/me', authenticateToken, updateUserValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user?.user_id;
    
    if (!userId) {
      return res.status(401).json(errorResponse('로그인이 필요합니다.', 401));
    }
    
    const result = await authService.updateUser(userId, req.body);
    res.status(result.success ? 200 : result.code).json(result);
  } catch (error) {
    console.error('Update user route error:', error);
    res.status(500).json(errorResponse('사용자 정보 업데이트 중 오류가 발생했습니다.', 500));
  }
});

// 네이버 로그인 리다이렉트
router.get('/social/naver/redirect', (req, res) => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri = process.env.NAVER_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback/naver`;
  const state = Math.random().toString(36).substring(2, 15);
  
  if (!clientId) {
    return res.status(500).send('네이버 클라이언트 ID가 설정되지 않았습니다.');
  }
  
  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  
  res.redirect(naverAuthUrl);
});

// 카카오 로그인 리다이렉트
router.get('/social/kakao/redirect', (req, res) => {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback/kakao`;
  
  if (!clientId) {
    return res.status(500).send('카카오 클라이언트 ID가 설정되지 않았습니다.');
  }
  
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  
  res.redirect(kakaoAuthUrl);
});

module.exports = router;
