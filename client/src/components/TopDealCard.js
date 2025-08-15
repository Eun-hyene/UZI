import React from 'react';
import { Crown, TrendingDown } from 'lucide-react';
import { formatPrice, calculateDiscountRate } from '../utils/helpers';

const TopDealCard = ({ deal, rank = 1, onCompare }) => {
  if (!deal) return null;
  const { model, variant, seller, price, originalPrice } = deal;
  const discountRate = calculateDiscountRate(originalPrice, price);
  const savings = originalPrice - price;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-5 md:p-6">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Crown className="w-6 h-6 md:w-7 md:h-7 text-amber-300" />
          </div>
          <div>
            <div className="text-white/80 text-sm">#{rank} 오늘의 최저가</div>
            <div className="text-lg md:text-xl font-extrabold">{model.name} <span className="text-white/80 font-semibold">{variant.storage}</span></div>
            <div className="text-xs md:text-sm text-white/80">{seller.name} • {seller.type === 'online' ? '온라인' : seller.type === 'offline' ? '오프라인' : '공식몰'}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl md:text-3xl font-extrabold">{formatPrice(price)}</div>
          <div className="text-xs md:text-sm text-white/80">출고가 대비 {discountRate}%↓</div>
        </div>
      </div>

      <div className="relative mt-4 md:mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="inline-flex items-center gap-1 bg-white/15 text-white px-2 py-1 rounded-full">
            <TrendingDown className="w-3 h-3" />
            <span className="font-semibold">{savings.toLocaleString()}원 절약</span>
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-white/90 transition"
            onClick={onCompare}
          >
            가격 비교하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopDealCard;

