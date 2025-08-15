const axios = require('axios');

class SocialService {
  // 네이버 로그인 처리
  async getNaverUserInfo(accessToken) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.data.resultcode !== '00') {
        throw new Error('네이버 사용자 정보 조회 실패');
      }
      
      const userInfo = response.data.response;
      
      return {
        providerId: userInfo.id,
        email: userInfo.email,
        nickname: userInfo.nickname || userInfo.name,
        profileImage: userInfo.profile_image,
        accessToken,
        expiresAt: new Date(Date.now() + 3600 * 1000) // 1시간 후 만료 (대략적)
      };
      
    } catch (error) {
      console.error('Naver user info error:', error);
      throw new Error('네이버 사용자 정보 조회 중 오류가 발생했습니다.');
    }
  }
  
  // 카카오 로그인 처리
  async getKakaoUserInfo(accessToken) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const userInfo = response.data;
      const kakaoAccount = userInfo.kakao_account;
      const profile = kakaoAccount.profile;
      
      return {
        providerId: userInfo.id.toString(),
        email: kakaoAccount.email,
        nickname: profile.nickname,
        profileImage: profile.profile_image_url,
        accessToken,
        expiresAt: new Date(Date.now() + 6 * 3600 * 1000) // 6시간 후 만료 (대략적)
      };
      
    } catch (error) {
      console.error('Kakao user info error:', error);
      throw new Error('카카오 사용자 정보 조회 중 오류가 발생했습니다.');
    }
  }
  
  // 네이버 액세스 토큰 발급
  async getNaverAccessToken(authCode, state) {
    try {
      const clientId = process.env.NAVER_CLIENT_ID;
      const clientSecret = process.env.NAVER_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('네이버 클라이언트 정보가 설정되지 않았습니다.');
      }
      
      const response = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: authCode,
          state: state
        }
      });
      
      return response.data.access_token;
      
    } catch (error) {
      console.error('Naver token error:', error);
      throw new Error('네이버 토큰 발급 중 오류가 발생했습니다.');
    }
  }
  
  // 카카오 액세스 토큰 발급
  async getKakaoAccessToken(authCode) {
    try {
      const clientId = process.env.KAKAO_CLIENT_ID;
      const clientSecret = process.env.KAKAO_CLIENT_SECRET;
      const redirectUri = process.env.KAKAO_REDIRECT_URI;
      
      if (!clientId) {
        throw new Error('카카오 클라이언트 정보가 설정되지 않았습니다.');
      }
      
      const params = {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: authCode,
        redirect_uri: redirectUri
      };
      
      if (clientSecret) {
        params.client_secret = clientSecret;
      }
      
      const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data.access_token;
      
    } catch (error) {
      console.error('Kakao token error:', error);
      throw new Error('카카오 토큰 발급 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new SocialService();
