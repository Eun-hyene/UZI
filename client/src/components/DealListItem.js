import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatPrice, calculateDiscountRate } from '../utils/helpers';

const DealListItem = ({ deal, index, onCompare }) => {
  const { model, variant, seller, price, originalPrice } = deal;
  const rate = calculateDiscountRate(originalPrice, price);

  return (
    <div className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">
          {index + 1}
        </div>
        <div>
          <div className="font-semibold text-text-800">{model.name} <span className="text-gray-500">{variant.storage}</span></div>
          <div className="text-xs text-gray-500">{seller.name} • {seller.type === 'online' ? '온라인' : seller.type === 'offline' ? '오프라인' : '공식몰'}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-bold text-text-800">{formatPrice(price)}</div>
          {price < originalPrice && (
            <div className="text-xs text-emerald-600">{rate}% 할인</div>
          )}
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition"
          onClick={onCompare}
        >
          비교 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DealListItem;

