import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyPage = () => {
  const { user, logout, logoutAll, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nickname: user?.nickname || '',
    phoneNumber: user?.phone_number || '',
    birthDate: user?.birth_date || '',
    gender: user?.gender || '',
    userType: user?.user_type || 'BUYER',
    marketingAgreed: user?.marketing_agreed || false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setEditData(prev => ({
      ...prev,
      phoneNumber: formatted
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUser(editData);
      setIsEditing(false);
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '프로필 업데이트에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      await logout();
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('모든 기기에서 로그아웃하시겠습니까?')) {
      await logoutAll();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { text: '정상', color: 'bg-green-100 text-green-800' },
      INACTIVE: { text: '비활성', color: 'bg-gray-100 text-gray-800' },
      SUSPENDED: { text: '정지', color: 'bg-red-100 text-red-800' },
      DELETED: { text: '삭제', color: 'bg-red-100 text-red-800' }
    };
    
    const badge = badges[status] || badges.ACTIVE;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const tabs = [
    // 역할별 탭 추가
    ...(user?.user_type === 'SELLER' 
      ? [{ id: 'store-management', name: '가게 관리', icon: '🏪' }]
      : [{ id: 'notifications', name: '알림 설정', icon: '🔔' }]
    ),
    { id: 'profile', name: '프로필', icon: '👤' },
    { id: 'security', name: '보안', icon: '🔒' },
    { id: 'preferences', name: '설정', icon: '⚙️' },
    { id: 'activity', name: '활동', icon: '📊' }
    
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.nickname?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.nickname}</h1>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(user?.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.user_type === 'SELLER' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {user?.user_type === 'SELLER' ? '🏪 판매자' : '🛒 구매자'}
                  </span>
                  {user?.email_verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      이메일 인증됨
                    </span>
                  )}
                  {user?.phone_verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      휴대폰 인증됨
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 메시지 */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">프로필 정보</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    수정
                  </button>
                ) : (
                  <div className="space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? '저장 중...' : '저장'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">닉네임</label>
                  <input
                    type="text"
                    name="nickname"
                    value={isEditing ? editData.nickname : (user?.nickname || '')}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${
                      isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">휴대폰 번호</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={isEditing ? editData.phoneNumber : (user?.phone_number || '')}
                    onChange={isEditing ? handlePhoneNumberChange : handleEditChange}
                    disabled={!isEditing}
                    placeholder="010-0000-0000"
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${
                      isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">생년월일</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={isEditing ? editData.birthDate : (user?.birth_date || '')}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${
                      isEditing ? 'focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">성별</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editData.gender}
                      onChange={handleEditChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">선택 안함</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                      <option value="OTHER">기타</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={user?.gender === 'M' ? '남성' : user?.gender === 'F' ? '여성' : user?.gender === 'OTHER' ? '기타' : ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자 유형</label>
                  {isEditing ? (
                    <select
                      name="userType"
                      value={editData.userType}
                      onChange={handleEditChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="BUYER">🛒 구매자</option>
                      <option value="SELLER">🏪 판매자</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={user?.user_type === 'SELLER' ? '🏪 판매자' : '🛒 구매자'}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">가입일</label>
                  <input
                    type="text"
                    value={formatDate(user?.created_at)}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      id="marketingAgreed"
                      name="marketingAgreed"
                      type="checkbox"
                      checked={editData.marketingAgreed}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="marketingAgreed" className="ml-2 block text-sm text-gray-900">
                      마케팅 정보 수신에 동의합니다
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">보안 설정</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">비밀번호 변경</h3>
                    <p className="text-sm text-gray-500">계정 보안을 위해 정기적으로 비밀번호를 변경하세요</p>
                  </div>
                  <Link
                    to="/change-password"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    변경
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">이메일 인증</h3>
                    <p className="text-sm text-gray-500">
                      {user?.email_verified ? '이메일이 인증되었습니다' : '이메일 인증이 필요합니다'}
                    </p>
                  </div>
                  {!user?.email_verified && (
                    <Link
                      to="/verify-email"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      인증하기
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">휴대폰 인증</h3>
                    <p className="text-sm text-gray-500">
                      {user?.phone_verified ? '휴대폰이 인증되었습니다' : '휴대폰 인증이 필요합니다'}
                    </p>
                  </div>
                  {!user?.phone_verified && (
                    <Link
                      to="/verify-phone"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      인증하기
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">세션 관리</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleLogout}
                      className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      이 기기에서 로그아웃
                    </button>
                    <button
                      onClick={handleLogoutAll}
                      className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 sm:ml-3"
                    >
                      모든 기기에서 로그아웃
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">설정</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">마케팅 정보 수신</h3>
                    <p className="text-sm text-gray-500">새로운 할인 정보와 이벤트를 이메일로 받아보세요</p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      user?.marketing_agreed ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={user?.marketing_agreed}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        user?.marketing_agreed ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">활동 정보</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900">마지막 로그인</h3>
                  <p className="text-lg font-semibold text-gray-600 mt-1">
                    {formatDate(user?.last_login_at)}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900">계정 상태</h3>
                  <div className="mt-1">
                    {getStatusBadge(user?.status)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 판매자 전용 - 가게 관리 */}
          {activeTab === 'store-management' && user?.user_type === 'SELLER' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">가게 관리</h2>
              
              <div className="space-y-6">
                {/* 가게 정보 카드 */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
                      🏪
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">내 가게</h3>
                      <p className="text-sm text-gray-600">가게 정보를 관리하고 상품을 등록하세요</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="bg-white border border-orange-300 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-50 font-medium">
                      가게 정보 등록
                    </button>
                    <button className="bg-white border border-orange-300 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-50 font-medium">
                      가게 정보 수정
                    </button>
                  </div>
                </div>

                {/* 상품 관리 */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">상품 관리</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">📱</div>
                      <h4 className="font-medium text-gray-900">상품 등록</h4>
                      <p className="text-sm text-gray-500 mt-1">새로운 휴대폰 상품을 등록하세요</p>
                      <button className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        등록하기
                      </button>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">📋</div>
                      <h4 className="font-medium text-gray-900">재고 관리</h4>
                      <p className="text-sm text-gray-500 mt-1">상품 재고를 확인하고 관리하세요</p>
                      <button className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        관리하기
                      </button>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">💰</div>
                      <h4 className="font-medium text-gray-900">가격 관리</h4>
                      <p className="text-sm text-gray-500 mt-1">상품 가격을 업데이트하세요</p>
                      <button className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                        수정하기
                      </button>
                    </div>
                  </div>
                </div>

                {/* 판매 통계 */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">판매 현황</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-500">등록 상품</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-500">문의 건수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-500">조회수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-gray-500">리뷰 평점</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 구매자 전용 - 알림 설정 */}
          {activeTab === 'notifications' && user?.user_type === 'BUYER' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">알림 설정</h2>
              
              <div className="space-y-6">
                {/* 가격 알림 설정 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      🔔
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">가격 알림</h3>
                      <p className="text-sm text-gray-600">원하는 조건의 휴대폰 가격 정보를 알림으로 받아보세요</p>
                    </div>
                  </div>
                  <button className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 font-medium">
                    새 알림 설정하기
                  </button>
                </div>

                {/* 알림 방식 설정 */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">알림 방식</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">📧</div>
                        <div>
                          <h4 className="font-medium text-gray-900">이메일 알림</h4>
                          <p className="text-sm text-gray-500">등록된 이메일로 알림을 받습니다</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                        role="switch"
                        aria-checked="true"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">💬</div>
                        <div>
                          <h4 className="font-medium text-gray-900">카카오톡 알림</h4>
                          <p className="text-sm text-gray-500">카카오톡으로 실시간 알림을 받습니다</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
                        role="switch"
                        aria-checked="false"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">📱</div>
                        <div>
                          <h4 className="font-medium text-gray-900">푸시 알림</h4>
                          <p className="text-sm text-gray-500">앱 푸시 알림으로 받습니다</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                        role="switch"
                        aria-checked="true"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 내 관심 상품 */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">관심 상품 알림</h3>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📱</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">관심 상품이 없습니다</h4>
                    <p className="text-gray-500 mb-4">관심 있는 휴대폰을 등록하고 가격 변동 알림을 받아보세요</p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                      관심 상품 추가하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
