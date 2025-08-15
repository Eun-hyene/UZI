import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smartphone, Home, MapPin, Crown, Calculator, User, LogOut, Settings } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Smartphone className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-text-800">우지</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-primary-50 text-primary-500' 
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">홈</span>
              </Link>
              <Link 
                to="/nationwide" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/nationwide') 
                    ? 'bg-primary-50 text-primary-500' 
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">전국 최저가</span>
              </Link>
              <Link 
                to="/map" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/map') 
                    ? 'bg-primary-50 text-primary-500' 
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">우리동네</span>
                
              </Link>
              <Link
                to="/plans"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/plans')
                    ? 'bg-primary-50 text-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">총비용 확인</span>
              </Link>
            </nav>

            {/* 사용자 메뉴 */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.nickname?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline">{user?.nickname}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <Link
                          to="/mypage"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          마이페이지
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          설정
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-lg transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 