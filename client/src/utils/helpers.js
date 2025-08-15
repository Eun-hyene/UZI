// 가격을 한국어 형식으로 포맷팅
export const formatPrice = (price) => {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(0)}만원`;
  }
  return `${price.toLocaleString()}원`;
};

// 가격을 숫자 형식으로 포맷팅
export const formatPriceNumber = (price) => {
  return price.toLocaleString();
};

// 거리 포맷팅
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${distance}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

// 두 좌표 간 거리(meters) - Haversine formula
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// 평점을 별점으로 표시
export const formatRating = (rating) => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 할인율 계산
export const calculateDiscountRate = (originalPrice, discountedPrice) => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// 색상 이름을 한국어로 변환
export const getColorName = (color) => {
  const colorMap = {
    black: '블랙',
    white: '화이트',
    blue: '블루',
    green: '그린',
    pink: '핑크',
    purple: '퍼플',
    natural: '내추럴'
  };
  return colorMap[color] || color;
};

// 판매처 타입을 한국어로 변환
export const getSellerTypeName = (type) => {
  const typeMap = {
    online: '온라인',
    offline: '오프라인',
    official: '공식몰'
  };
  return typeMap[type] || type;
};

// 조건 텍스트를 간단하게 표시
export const simplifyCondition = (condition) => {
  const conditionMap = {
    '무이자 12개월 할부': '무이자 할부',
    '당일 출고': '당일 출고',
    '무료 배송': '무료 배송',
    '현장 할인': '현장 할인',
    '케이스 무료 증정': '케이스 증정',
    '공식 보증': '공식 보증',
    '무료 교환': '무료 교환',
    '정품 보장': '정품 보장'
  };
  return conditionMap[condition] || condition;
}; 