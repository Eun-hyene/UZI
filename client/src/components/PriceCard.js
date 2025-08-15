import React from 'react';
import { Star, MapPin, Phone, ExternalLink, Truck } from 'lucide-react';
import { 
  formatPrice, 
  formatPriceNumber, 
  formatDistance,
  getSellerTypeName,
  simplifyCondition,
  calculateDiscountRate
} from '../utils/helpers';

const PriceCard = ({ priceData, isBestPrice = false }) => {
  const { seller, price, originalPrice, discount, conditions, stockStatus } = priceData;

  const discountRate = calculateDiscountRate(originalPrice, price);

  return (
    <div className={`price-card relative ${isBestPrice ? 'ring-2 ring-accent-500' : ''}`}>
      {isBestPrice && (
        <div className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          최저가
        </div>
      )}
      
      {/* 판매처 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">
              {seller.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-text-800">{seller.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{getSellerTypeName(seller.type)}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span>{seller.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가격 정보 */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-text-800">
            {formatPrice(price)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm font-semibold text-accent-500">
                {discountRate}% 할인
              </span>
            </>
          )}
        </div>
        {discount > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            {formatPriceNumber(discount)}원 절약
          </div>
        )}
      </div>

      {/* 조건 및 혜택 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {conditions.slice(0, 2).map((condition, index) => (
            <span 
              key={index}
              className="inline-block bg-primary-50 text-primary-600 text-xs px-2 py-1 rounded-full"
            >
              {simplifyCondition(condition)}
            </span>
          ))}
          {conditions.length > 2 && (
            <span className="text-xs text-gray-500">
              +{conditions.length - 2}개 더
            </span>
          )}
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="space-y-2 text-sm text-gray-600">
        {seller.type === 'offline' && seller.address && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{seller.address}</span>
            {seller.distance && (
              <span className="text-accent-500">
                ({formatDistance(seller.distance)})
              </span>
            )}
          </div>
        )}
        
        {seller.type === 'online' && priceData.estimatedDelivery && (
          <div className="flex items-center space-x-1">
            <Truck className="w-3 h-3" />
            <span>배송: {priceData.estimatedDelivery}</span>
          </div>
        )}
        
        {seller.type === 'offline' && seller.businessHours && (
          <div className="text-xs">
            영업시간: {seller.businessHours}
          </div>
        )}
      </div>

      {/* 재고 상태 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${stockStatus ? 'bg-success-500' : 'bg-error-500'}`} />
            <span className="text-sm text-gray-600">
              {stockStatus ? '재고 있음' : '재고 없음'}
            </span>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex space-x-2">
            {seller.type === 'online' && priceData.purchaseUrl ? (
              <a
                href={priceData.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-primary-500 hover:text-primary-700 text-sm font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                <span>구매하기</span>
              </a>
            ) : seller.type === 'offline' && priceData.contactNumber ? (
              <a
                href={`tel:${priceData.contactNumber}`}
                className="flex items-center space-x-1 text-primary-500 hover:text-primary-700 text-sm font-medium"
              >
                <Phone className="w-3 h-3" />
                <span>연락하기</span>
              </a>
            ) : (
              <button className="text-primary-500 hover:text-primary-700 text-sm font-medium">
                상담받기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard; 