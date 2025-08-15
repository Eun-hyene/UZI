import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Grid, List } from 'lucide-react';
import { phoneModels } from '../data/phoneData';
import { formatPrice } from '../utils/helpers';

const BrandSelectionPage = () => {
  const { brand } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const models = useMemo(() => phoneModels[brand] || [], [brand]);
  
  // 시리즈 필터 옵션
  const seriesOptions = useMemo(() => {
    const series = [...new Set(models.map(model => model.series))];
    return [
      { value: 'all', label: '전체' },
      ...series.map(s => ({ value: s, label: s }))
    ];
  }, [models]);

  // 가격대 필터 옵션
  const priceRangeOptions = [
    { value: 'all', label: '전체' },
    { value: '0-500000', label: '50만원 이하' },
    { value: '500000-1000000', label: '50-100만원' },
    { value: '1000000+', label: '100만원 이상' }
  ];

  // 필터링된 모델
  const filteredModels = useMemo(() => {
    return models.filter(model => {
      // 시리즈 필터
      if (selectedSeries !== 'all' && model.series !== selectedSeries) {
        return false;
      }
      
      // 가격대 필터
      if (selectedPriceRange !== 'all') {
        const [min, max] = selectedPriceRange.split('-').map(Number);
        if (selectedPriceRange === '1000000+') {
          return model.averagePrice >= 1000000;
        }
        return model.averagePrice >= min && model.averagePrice < max;
      }
      
      return true;
    });
  }, [models, selectedSeries, selectedPriceRange]);

  const handleModelSelect = (modelId) => {
    navigate(`/compare/${modelId}`);
  };

  const getBrandInfo = () => {
    switch (brand) {
      case 'galaxy':
        return {
          name: '갤럭시',
          description: 'Samsung Galaxy 시리즈',
          color: 'from-blue-500 to-purple-600'
        };
      case 'iphone':
        return {
          name: '아이폰',
          description: 'Apple iPhone 시리즈',
          color: 'from-gray-800 to-gray-600'
        };
      default:
        return { name: '', description: '', color: '' };
    }
  };

  const brandInfo = getBrandInfo();

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-800">{brandInfo.name}</h1>
                <p className="text-gray-600">{brandInfo.description}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredModels.length}개 모델
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
            
            {/* 시리즈 필터 */}
            <select 
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {seriesOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 가격대 필터 */}
            <select 
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {priceRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* 뷰 모드 토글 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredModels.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">조건에 맞는 모델이 없습니다.</p>
            <button 
              onClick={() => {
                setSelectedSeries('all');
                setSelectedPriceRange('all');
              }}
              className="mt-4 text-primary-500 hover:text-primary-700"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className={`card cursor-pointer hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex items-center space-x-4' : ''
                }`}
                onClick={() => handleModelSelect(model.id)}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${brandInfo.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xl font-bold">
                          {brand === 'galaxy' ? 'S' : 'i'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text-800 mb-2">{model.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{model.series}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-500">
                        {formatPrice(model.averagePrice)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {model.variants.length}개 옵션
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 bg-gradient-to-br ${brandInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-lg font-bold">
                        {brand === 'galaxy' ? 'S' : 'i'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-800">{model.name}</h3>
                      <p className="text-gray-600 text-sm">{model.series}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {model.specs.display} • {model.specs.camera}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary-500">
                        {formatPrice(model.averagePrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {model.variants.length}개 옵션
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandSelectionPage; 