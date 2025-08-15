const authService = require('../services/auth.service');
const { errorResponse } = require('../utils/response');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json(errorResponse('액세스 토큰이 필요합니다.', 401));
    }
    
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json(errorResponse('유효하지 않은 토큰입니다.', 401));
    }
    
    // 사용자 정보 조회
    const [user] = await authService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json(errorResponse('존재하지 않는 사용자입니다.', 401));
    }
    
    // req.user에 사용자 정보 저장
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json(errorResponse('인증 중 오류가 발생했습니다.', 401));
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = authService.verifyToken(token);
      
      if (decoded) {
        const [user] = await authService.getUserById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // 에러가 있어도 계속 진행
  }
};

// 권한 체크 미들웨어
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('로그인이 필요한 서비스입니다.', 401));
  }
  next();
};

// 이메일 인증 확인 미들웨어
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('로그인이 필요한 서비스입니다.', 401));
  }
  
  if (!req.user.email_verified) {
    return res.status(403).json(errorResponse('이메일 인증이 필요한 서비스입니다.', 403));
  }
  
  next();
};

// 관리자 권한 체크 미들웨어 (향후 확장용)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('로그인이 필요한 서비스입니다.', 401));
  }
  
  // 현재는 특정 이메일로 관리자 확인 (향후 role 기반으로 변경 가능)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json(errorResponse('관리자 권한이 필요합니다.', 403));
  }
  
  next();
};

// 사용자 본인 확인 미들웨어
const requireSelfOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('로그인이 필요한 서비스입니다.', 401));
    }
    
    const targetUserId = parseInt(req.params[userIdParam]);
    const currentUserId = req.user.user_id;
    
    // 본인이거나 관리자인 경우 허용
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(req.user.email);
    
    if (currentUserId !== targetUserId && !isAdmin) {
      return res.status(403).json(errorResponse('자신의 정보만 접근할 수 있습니다.', 403));
    }
    
    next();
  };
};

// 계정 상태 확인 미들웨어
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('로그인이 필요한 서비스입니다.', 401));
  }
  
  if (req.user.status !== 'ACTIVE') {
    let message = '사용할 수 없는 계정입니다.';
    
    switch (req.user.status) {
      case 'INACTIVE':
        message = '비활성화된 계정입니다. 고객센터에 문의해주세요.';
        break;
      case 'SUSPENDED':
        message = '정지된 계정입니다. 고객센터에 문의해주세요.';
        break;
      case 'DELETED':
        message = '삭제된 계정입니다.';
        break;
    }
    
    return res.status(403).json(errorResponse(message, 403));
  }
  
  next();
};

// 지역 기반 서비스 접근 권한 확인 (우리동네 페이지용)
const requireLocationAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('로그인 후 이용 가능한 서비스입니다.', 401));
  }
  
  // 향후 사용자의 위치 정보나 인증 레벨에 따른 추가 검증 로직 추가 가능
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAuth,
  requireEmailVerified,
  requireAdmin,
  requireSelfOrAdmin,
  requireActiveAccount,
  requireLocationAccess
};
