import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import NationwideLowestPage from './pages/NationwideLowestPage';
import PlanComparisonPage from './pages/PlanComparisonPage';
import BrandSelectionPage from './pages/BrandSelectionPage';
import PriceComparisonPage from './pages/PriceComparisonPage';
import MapStoresPage from './pages/MapStoresPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import SocialLoginCallback from './pages/SocialLoginCallback';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback/naver" element={<SocialLoginCallback />} />
              <Route path="/auth/callback/kakao" element={<SocialLoginCallback />} />
              <Route path="/nationwide" element={<NationwideLowestPage />} />
              <Route path="/plans" element={<PlanComparisonPage />} />
              <Route path="/:brand" element={<BrandSelectionPage />} />
              <Route path="/compare/:modelId" element={<PriceComparisonPage />} />
              
              {/* 우리동네 기능 - 로그인 필요 */}
              <Route 
                path="/map" 
                element={
                  <ProtectedRoute requirePermission="location">
                    <MapStoresPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 마이페이지 - 로그인 필요 */}
              <Route 
                path="/mypage" 
                element={
                  <ProtectedRoute>
                    <MyPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 