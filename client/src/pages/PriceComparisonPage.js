import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { phoneModels, generatePriceData } from '../data/phoneData';
import { formatPrice } from '../utils/helpers';
import PriceCard from '../components/PriceCard';

const PriceComparisonPage = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterType, setFilterType] = useState('all');

  // 모델 정보 찾기
  const model = useMemo(() => {
    const allModels = [...phoneModels.galaxy, ...phoneModels.iphone];
    return allModels.find(m => m.id === modelId);
  }, [modelId]);

  // 선택된 variant 찾기
  const selectedVariant = useMemo(() => {
    if (!model || !selectedStorage) return null;
    return model.variants.find(v => v.storage === selectedStorage);
  }, [model, selectedStorage]);

  // 가격 데이터 생성
  const priceData = useMemo(() => {
    if (!selectedVariant) return [];
    return generatePriceData(modelId, selectedVariant);
  }, [modelId, selectedVariant]);

  // 필터링 및 정렬된 가격 데이터
  const filteredAndSortedData = useMemo(() => {
    let filtered = priceData;

    // 판매처 타입 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.seller.type === filterType);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.seller.rating - a.seller.rating;
        case 'distance':
          return (a.seller.distance || 0) - (b.seller.distance || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [priceData, sortBy, filterType]);

  // 최저가 찾기
  const lowestPrice = useMemo(() => {
    if (filteredAndSortedData.length === 0) return null;
    return filteredAndSortedData[0];
  }, [filteredAndSortedData]);

  // 컴포넌트 마운트 시 첫 번째 variant 선택
  React.useEffect(() => {
    if (model && model.variants.length > 0 && !selectedStorage) {
      setSelectedStorage(model.variants[0].storage);
      setSelectedColor(model.variants[0].colors[0]);
    }
  }, [model, selectedStorage]);

  if (!model) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">모델을 찾을 수 없습니다.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-primary-500 hover:text-primary-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-800">{model.name}</h1>
                <p className="text-gray-600">{model.brand} • {model.series}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">평균 가격</div>
              <div className="text-lg font-semibold text-primary-500">
                {formatPrice(model.averagePrice)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {model.brand === 'Samsung' ? 'S' : 'i'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-800">{model.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{model.specs.display}</span>
                  <span>•</span>
                  <span>{model.specs.camera}</span>
                  <span>•</span>
                  <span>{model.specs.battery}</span>
                </div>
              </div>
            </div>

            {/* Variant Selection */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {model.variants.map(variant => (
                  <option key={variant.storage} value={variant.storage}>
                    {variant.storage}
                  </option>
                ))}
              </select>

              {selectedVariant && (
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {selectedVariant.colors.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">필터:</span>
            </div>
            
            {/* 판매처 타입 필터 */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="official">공식몰</option>
            </select>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="price">가격순</option>
              <option value="rating">평점순</option>
              <option value="distance">거리순</option>
            </select>

            <div className="text-sm text-gray-500">
              {filteredAndSortedData.length}개 판매처
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      {lowestPrice && (
        <div className="bg-accent-50 border-b border-accent-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-accent-700">최저가:</span>
                <span className="text-lg font-bold text-accent-700">
                  {formatPrice(lowestPrice.price)}
                </span>
                <span className="text-sm text-accent-600">
                  ({lowestPrice.seller.name})
                </span>
              </div>
              <div className="text-sm text-accent-600">
                {formatPrice(lowestPrice.originalPrice - lowestPrice.price)}원 절약
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Cards */}
      <div className="container mx-auto px-4 py-8">
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">조건에 맞는 판매처가 없습니다.</p>
            <button 
              onClick={() => {
                setFilterType('all');
                setSortBy('price');
              }}
              className="mt-4 text-primary-500 hover:text-primary-700"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedData.map((priceData, index) => (
              <PriceCard
                key={priceData.id}
                priceData={priceData}
                isBestPrice={index === 0 && sortBy === 'price'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparisonPage; 