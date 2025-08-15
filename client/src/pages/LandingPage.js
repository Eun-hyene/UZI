import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, ShieldCheck, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero (핵심 메시지 + CTA) */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-800 mb-4">휴대폰 가격 비교 · 추천</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">실시간 수집·표준화된 가격과 총비용까지 한눈에. 합리적인 구매를 위한 단 하나의 화면.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/nationwide" className="btn-primary">전국 최저가 TOP 10</Link>
          <Link to="/map" className="btn-secondary">우리동네 최저가</Link>
          <Link to="/plans" className="btn-secondary">총비용 계산</Link>
        </div>
      </section>

      {/* 핵심 가치 3가지 */}
      <section className="container mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <Scan className="w-7 h-7 mx-auto text-primary-500" />
            <h3 className="mt-3 font-bold text-text-800">실시간 수집·표준화</h3>
            <p className="text-gray-600 text-sm mt-1">정규화한 신뢰 가능한 가격</p>
          </div>
          <div className="card p-6 text-center">
            <BarChart3 className="w-7 h-7 mx-auto text-primary-500" />
            <h3 className="mt-3 font-bold text-text-800">총비용 비교 및 확인</h3>
            <p className="text-gray-600 text-sm mt-1">약정·요금제·부가까지 반영한 연/월 총액</p>
          </div>
          <div className="card p-6 text-center">
            <ShieldCheck className="w-7 h-7 mx-auto text-primary-500" />
            <h3 className="mt-3 font-bold text-text-800">투명한 의사결정</h3>
            <p className="text-gray-600 text-sm mt-1">지역 상생과 공정한 가격 공개를 지향</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

