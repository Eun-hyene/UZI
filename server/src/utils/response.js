'use strict';

// 기존 함수들 (호환성 유지)
exports.ok = (res, data) => res.json({ ok: true, data });

exports.fail = (res, code, message, status = 400) =>
  res.status(status).json({ ok: false, error: { code, message } });

// 새로운 인증 시스템용 응답 함수들
exports.successResponse = (message, data = null, code = 200) => ({
  success: true,
  message,
  data,
  code
});

exports.errorResponse = (message, code = 400, errors = null) => ({
  success: false,
  message,
  code,
  errors
});


