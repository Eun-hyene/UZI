import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SocialLoginCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const provider = window.location.pathname.includes('naver') ? 'naver' : 'kakao';

    if (error) {
      // 에러 발생 시 부모 창에 메시지 전송
      window.opener?.postMessage({
        type: 'SOCIAL_LOGIN_ERROR',
        message: '소셜 로그인 중 오류가 발생했습니다.'
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // 인증 코드를 서버로 전송하여 토큰 교환
      const handleSocialLogin = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
          
          const payload = provider === 'naver' 
            ? { code, state }
            : { code };
          
          const response = await fetch(`${API_BASE_URL}/auth/social/${provider}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.success) {
            // 성공 시 부모 창에 사용자 데이터 전송
            window.opener?.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              data: data.data
            }, window.location.origin);
          } else {
            // 실패 시 에러 메시지 전송
            window.opener?.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              message: data.message || '소셜 로그인에 실패했습니다.'
            }, window.location.origin);
          }
        } catch (error) {
          console.error('Social login error:', error);
          window.opener?.postMessage({
            type: 'SOCIAL_LOGIN_ERROR',
            message: '소셜 로그인 중 오류가 발생했습니다.'
          }, window.location.origin);
        } finally {
          window.close();
        }
      };

      handleSocialLogin();
    } else {
      // 코드가 없는 경우 에러 처리
      window.opener?.postMessage({
        type: 'SOCIAL_LOGIN_ERROR',
        message: '인증 코드가 없습니다.'
      }, window.location.origin);
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          로그인 처리 중...
        </h2>
        <p className="text-gray-600">
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
};

export default SocialLoginCallback;
