import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Axios 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 전송을 위해
});

// 요청 인터셉터: 액세스 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });
        
        const { accessToken } = response.data.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        
        // 원래 요청에 새 토큰 적용하여 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // 서버에서 최신 사용자 정보 확인
          const response = await apiClient.get('/auth/me');
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // 토큰이 유효하지 않은 경우 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 회원가입
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user: newUser, tokens } = response.data.data;
        
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        return newUser;
      } else {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '회원가입 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  };

  // 로그인
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data); // 디버깅용 로그
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        
        console.log('User data:', userData); // 디버깅용 로그
        console.log('Tokens:', tokens); // 디버깅용 로그
        
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return userData;
      } else {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error); // 상세한 에러 로그
      const errorMessage = error.response?.data?.message || error.message || '로그인 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  };

  // 소셜 로그인
  const socialLogin = async (provider) => {
    try {
      // 소셜 로그인은 팝업 창을 통해 처리
      const popup = window.open(
        `${API_BASE_URL}/auth/social/${provider}/redirect`,
        'socialLogin',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve, reject) => {
        const handleMessage = (event) => {
          // 보안을 위해 origin 확인
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
            const { user: userData, tokens } = event.data.data;
            
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
            
            window.removeEventListener('message', handleMessage);
            popup.close();
            resolve(userData);
          } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error(event.data.message || '소셜 로그인에 실패했습니다.'));
          }
        };

        window.addEventListener('message', handleMessage);

        // 팝업이 닫힌 경우 처리
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('소셜 로그인이 취소되었습니다.'));
          }
        }, 1000);
        
        // 팝업이 제대로 열리지 않은 경우 처리
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.'));
        }
      });
    } catch (error) {
      const errorMessage = error.message || '소셜 로그인 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 모든 기기에서 로그아웃
  const logoutAll = async () => {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 사용자 정보 업데이트
  const updateUser = async (userData) => {
    try {
      const response = await apiClient.put('/auth/me', userData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      } else {
        throw new Error(response.data.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '프로필 업데이트 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  };

  // 권한 확인 유틸리티
  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    
    switch (permission) {
      case 'location': // 우리동네 기능 접근
        return user.status === 'ACTIVE';
      case 'email_verified': // 이메일 인증 필요 기능
        return user.email_verified;
      case 'phone_verified': // 휴대폰 인증 필요 기능
        return user.phone_verified;
      case 'seller': // 판매자 전용 기능
        return user.user_type === 'SELLER';
      case 'buyer': // 구매자 전용 기능
        return user.user_type === 'BUYER';
      default:
        return true;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    register,
    login,
    socialLogin,
    logout,
    logoutAll,
    updateUser,
    hasPermission,
    apiClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
