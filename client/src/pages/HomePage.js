import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, TrendingUp, MapPin, Tag, Layers } from 'lucide-react';
import { phoneModels, generatePriceData } from '../data/phoneData';
import { formatPrice, calculateDiscountRate } from '../utils/helpers';
import TopDealCard from '../components/TopDealCard';
import DealListItem from '../components/DealListItem';

const HomePage = () => {
  const navigate = useNavigate();

  const handleBrandSelect = (brand) => {
    navigate(`/${brand}`);
  };

  const [sellerFilter, setSellerFilter] = React.useState('all'); // all | online | offline | official

  // 모든 모델의 모든 변형/판매처 가격을 합쳐 최저가 TOP 10 산출
  const allDeals = React.useMemo(() => {
    const all = [...phoneModels.galaxy, ...phoneModels.iphone];
    const aggregated = [];
    all.forEach((model) => {
      model.variants.forEach((variant) => {
        const prices = generatePriceData(model.id, variant);
        prices.forEach((p) => {
          aggregated.push({ ...p, model, variant });
        });
      });
    });
    return aggregated;
  }, []);

  const top10 = React.useMemo(() => {
    let list = allDeals;
    if (sellerFilter !== 'all') {
      list = list.filter((d) => d.seller.type === sellerFilter);
    }
    return [...list]
      .sort((a, b) => a.price - b.price)
      .slice(0, 10);
  }, [allDeals, sellerFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero: 짧고 강력한 가치 제안 */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-800">
              지금 가장 싸게 사는 방법, 우지
            </h1>
            <p className="text-gray-600 mt-2">브랜드/방식 상관없이 현재 최저가 TOP 10을 바로 확인하세요.</p>
          </div>
          <Smartphone className="hidden md:block w-12 h-12 text-primary-500" />
        </div>
      </section>

      {/* TOP 10 컨트롤 / 레이아웃 */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">판매처</span>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
              >
                <option value="all">전체</option>
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
                <option value="official">공식몰</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={() => navigate('/map')}>
                <MapPin className="w-4 h-4" /> 근처 매장 보기
              </button>
            </div>
          </div>

          {/* 상단 하이라이트 카드 */}
          {top10[0] && (
            <TopDealCard
              deal={top10[0]}
              rank={1}
              onCompare={() => navigate(`/compare/${top10[0].model.id}`)}
            />
          )}
        </div>
      </section>

      {/* 최저가 TOP 10 리스트 */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
          {top10.slice(1).map((deal, index) => (
            <DealListItem
              key={`${deal.id}_${index + 1}`}
              deal={deal}
              index={index + 1}
              onCompare={() => navigate(`/compare/${deal.model.id}`)}
            />
          ))}
        </div>
        {top10.length <= 1 && (
          <div className="text-center text-gray-500 py-16">조건에 맞는 딜이 없습니다.</div>
        )}
      </section>
    </div>
  );
};

export default HomePage; 