import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { phoneModels, generatePriceData } from '../data/phoneData';
import { Filter, Crown, MapPin } from 'lucide-react';
import TopDealCard from '../components/TopDealCard';
import DealListItem from '../components/DealListItem';

const NationwideLowestPage = () => {
  const navigate = useNavigate();
  const [brandFilter, setBrandFilter] = useState({ galaxy: true, iphone: true });
  const [sellerFilter, setSellerFilter] = useState('all');

  const allDeals = useMemo(() => {
    const models = [
      ...(brandFilter.galaxy ? phoneModels.galaxy : []),
      ...(brandFilter.iphone ? phoneModels.iphone : []),
    ];
    const acc = [];
    models.forEach((m) => {
      m.variants.forEach((v) => {
        const arr = generatePriceData(m.id, v);
        arr.forEach((p) => acc.push({ ...p, model: m, variant: v }));
      });
    });
    return acc;
  }, [brandFilter]);

  const filtered = useMemo(() => {
    let list = allDeals;
    if (sellerFilter !== 'all') {
      list = list.filter((d) => d.seller.type === sellerFilter);
    }
    return [...list].sort((a, b) => a.price - b.price);
  }, [allDeals, sellerFilter]);

  const top10 = useMemo(() => filtered.slice(0, 10), [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-text-800 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> 전국 최저가 TOP 10</h1>
          <div className="flex items-center gap-3 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={brandFilter.galaxy} onChange={(e) => setBrandFilter((s) => ({ ...s, galaxy: e.target.checked }))} />
              <span>Galaxy</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={brandFilter.iphone} onChange={(e) => setBrandFilter((s) => ({ ...s, iphone: e.target.checked }))} />
              <span>iPhone</span>
            </label>
            <select
              className="px-2 py-1 border border-gray-300 rounded"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="official">공식몰</option>
            </select>
            <button className="btn-secondary hidden md:inline-flex items-center gap-1" onClick={() => navigate('/map')}>
              <MapPin className="w-4 h-4" /> 우리동네 보기
            </button>
          </div>
        </div>

        {/* 상단 하이라이트 */}
        {top10[0] && (
          <div className="mb-4">
            <TopDealCard
              deal={top10[0]}
              rank={1}
              onCompare={() => navigate(`/compare/${top10[0].model.id}`)}
            />
          </div>
        )}

        {/* 2~10위 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {top10.slice(1).map((deal, i) => (
            <DealListItem
              key={deal.id + '_' + (i + 2)}
              deal={deal}
              index={i + 1}
              onCompare={() => navigate(`/compare/${deal.model.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NationwideLowestPage;

