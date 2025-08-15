import React, { useMemo, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

// 기본 부가서비스 옵션들
const defaultAddOnOptions = [
  { id: 'addon1', name: '부가서비스 1', monthlyFee: 5000 },
  { id: 'addon2', name: '부가서비스 2', monthlyFee: 3000 },
  { id: 'addon3', name: '부가서비스 3', monthlyFee: 2000 },
  { id: 'addon4', name: '부가서비스 4', monthlyFee: 4000 },
];

const PlanComparisonPage = () => {
  // 사용자가 직접 입력하는 요금제들
  const [userPlans, setUserPlans] = useState([
    { id: 1, name: '요금제 1', monthlyFee: 29000, minimumContract: 6, hasMinimumPrice: false, minimumPrice: 0 },
    { id: 2, name: '요금제 2', monthlyFee: 39000, minimumContract: 6, hasMinimumPrice: false, minimumPrice: 0 },
  ]);
  
  const [selectedPlanIds, setSelectedPlanIds] = useState([1, 2]);
  const [dataUsageGB, setDataUsageGB] = useState(15); // 월 데이터 사용량
  const [voiceMinutes, setVoiceMinutes] = useState(200); // 월 통화량
  const [devicePrice, setDevicePrice] = useState(0); // 할부 원금
  const [installMonths, setInstallMonths] = useState(12); // 할부 개월 수
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const deviceMonthly = useMemo(() => {
    return devicePrice > 0 && installMonths > 0 ? Math.round(devicePrice / installMonths) : 0;
  }, [devicePrice, installMonths]);

  // 요금제 추가 함수
  const addNewPlan = () => {
    const newId = Math.max(...userPlans.map(p => p.id)) + 1;
    setUserPlans([...userPlans, { 
      id: newId, 
      name: `요금제 ${newId}`, 
      monthlyFee: 30000, 
      minimumContract: 6, 
      hasMinimumPrice: false, 
      minimumPrice: 0 
    }]);
  };

  // 요금제 업데이트 함수
  const updatePlan = (id, field, value) => {
    setUserPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, [field]: value } : plan
    ));
  };

  // 요금제 삭제 함수
  const deletePlan = (id) => {
    setUserPlans(prev => prev.filter(plan => plan.id !== id));
    setSelectedPlanIds(prev => prev.filter(planId => planId !== id));
  };

  // 부가서비스 추가 함수
  const addAddOn = () => {
    const newId = `addon${selectedAddOns.length + 1}`;
    setSelectedAddOns([...selectedAddOns, { 
      id: newId, 
      name: `부가서비스 ${selectedAddOns.length + 1}`, 
      monthlyFee: 3000,
      minimumContract: 6,
      hasMinimumPrice: false,
      minimumPrice: 0
    }]);
  };

  // 부가서비스 업데이트 함수
  const updateAddOn = (id, field, value) => {
    setSelectedAddOns(prev => prev.map(addon => 
      addon.id === id ? { ...addon, [field]: value } : addon
    ));
  };

  // 부가서비스 삭제 함수
  const deleteAddOn = (id) => {
    setSelectedAddOns(prev => prev.filter(addon => addon.id !== id));
  };

  // 월별 비용 계산 (의무기간 후 최저가격 적용)
  const calculateMonthlyCost = (plan, monthIndex) => {
    const isAfterMinimum = monthIndex >= plan.minimumContract;
    const planFee = (isAfterMinimum && plan.hasMinimumPrice) ? plan.minimumPrice : plan.monthlyFee;
    
    const addOnsFee = selectedAddOns.reduce((sum, addon) => {
      const isAfterAddonMinimum = monthIndex >= addon.minimumContract;
      const addonFee = (isAfterAddonMinimum && addon.hasMinimumPrice) ? addon.minimumPrice : addon.monthlyFee;
      return sum + addonFee;
    }, 0);
    
    const deviceFee = monthIndex < installMonths ? deviceMonthly : 0;
    
    return planFee + addOnsFee + deviceFee;
  };

  const datasets = useMemo(() => {
    return selectedPlanIds.map((id, index) => {
      const plan = userPlans.find((p) => p.id === id);
      if (!plan) return null;
      
      const data = months.map((_, idx) => {
        const isAfterMinimum = idx >= plan.minimumContract;
        const planFee = (isAfterMinimum && plan.hasMinimumPrice) ? plan.minimumPrice : plan.monthlyFee;
        
        const addOnsFee = selectedAddOns.reduce((sum, addon) => {
          const isAfterAddonMinimum = idx >= addon.minimumContract;
          const addonFee = (isAfterAddonMinimum && addon.hasMinimumPrice) ? addon.minimumPrice : addon.monthlyFee;
          return sum + addonFee;
        }, 0);
        
        const deviceFee = idx < installMonths ? deviceMonthly : 0;
        
        return planFee + addOnsFee + deviceFee;
      });
      
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
      
      return {
        label: plan.name,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: 'transparent',
        tension: 0.1
      };
    }).filter(Boolean);
  }, [selectedPlanIds, userPlans, selectedAddOns, deviceMonthly, installMonths]);

  const chartData = { labels: months, datasets };

  // 연간 총 비용 계산
  const totalYearCost = (planId) => {
    const plan = userPlans.find((p) => p.id === planId);
    if (!plan) return 0;
    
    return months.reduce((acc, _, idx) => acc + calculateMonthlyCost(plan, idx), 0);
  };

  // 총비용 비교를 위한 바 차트 데이터
  const barChartData = useMemo(() => {
    const selectedPlans = userPlans.filter(plan => selectedPlanIds.includes(plan.id));
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
    
    return {
      labels: selectedPlans.map(plan => plan.name),
      datasets: [{
        label: '연간 총 비용',
        data: selectedPlans.map(plan => totalYearCost(plan.id)),
        backgroundColor: selectedPlans.map((_, index) => colors[index % colors.length] + '80'),
        borderColor: selectedPlans.map((_, index) => colors[index % colors.length]),
        borderWidth: 2
      }]
    };
  }, [selectedPlanIds, userPlans, selectedAddOns, deviceMonthly, installMonths]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">총비용 계산기</h1>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* 좌측: 설정 영역 */}
          <div className="space-y-4">
            {/* 요금제 관리 */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">요금제 관리</h3>
                <button
                  onClick={addNewPlan}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  + 추가
                </button>
              </div>
              
                            <div className="space-y-2 max-h-64 overflow-auto">
                {userPlans.map((plan) => (
                  <div key={plan.id} className="border rounded p-2 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
                        className="font-medium text-xs border-none bg-transparent flex-1"
                      />
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-12 text-xs">월요금:</span>
                        <input
                          type="number"
                          value={plan.monthlyFee}
                          onChange={(e) => updatePlan(plan.id, 'monthlyFee', Number(e.target.value) || 0)}
                          className="flex-1 px-1 py-1 border rounded text-xs"
                        />
                        <span className="text-xs">원</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="w-12 text-xs">의무:</span>
                        <select
                          value={plan.minimumContract}
                          onChange={(e) => updatePlan(plan.id, 'minimumContract', Number(e.target.value))}
                          className="flex-1 px-1 py-1 border rounded text-xs"
                        >
                          {[0, 3, 6, 12, 24].map(m => (
                            <option key={m} value={m}>{m}개월</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={plan.hasMinimumPrice}
                            onChange={(e) => updatePlan(plan.id, 'hasMinimumPrice', e.target.checked)}
                            className="scale-75"
                          />
                          <span>다른 요금제 적용</span>
                        </label>
                      </div>
                      
                      {plan.hasMinimumPrice && (
                        <div className="flex items-center gap-1">
                          <span className="w-12 text-xs">변경:</span>
                          <input
                            type="number"
                            value={plan.minimumPrice}
                            onChange={(e) => updatePlan(plan.id, 'minimumPrice', Number(e.target.value) || 0)}
                            className="flex-1 px-1 py-1 border rounded text-xs"
                          />
                          <span className="text-xs">원</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedPlanIds.includes(plan.id)}
                            onChange={(e) => {
                              setSelectedPlanIds(prev => 
                                e.target.checked 
                                  ? [...prev, plan.id] 
                                  : prev.filter(id => id !== plan.id)
                              );
                            }}
                            className="scale-75"
                          />
                          <span>비교에 포함</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 부가서비스 관리 */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">부가서비스</h3>
                <button
                  onClick={addAddOn}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  + 추가
                </button>
              </div>

                            <div className="space-y-2 max-h-48 overflow-auto">
                {selectedAddOns.map((addon) => (
                  <div key={addon.id} className="border rounded p-2 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => updateAddOn(addon.id, 'name', e.target.value)}
                        className="font-medium text-xs border-none bg-transparent flex-1"
                      />
                      <button
                        onClick={() => deleteAddOn(addon.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-12 text-xs">월요금:</span>
                        <input
                          type="number"
                          value={addon.monthlyFee}
                          onChange={(e) => updateAddOn(addon.id, 'monthlyFee', Number(e.target.value) || 0)}
                          className="flex-1 px-1 py-1 border rounded text-xs"
                        />
                        <span className="text-xs">원</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="w-12 text-xs">의무:</span>
                        <select
                          value={addon.minimumContract}
                          onChange={(e) => updateAddOn(addon.id, 'minimumContract', Number(e.target.value))}
                          className="flex-1 px-1 py-1 border rounded text-xs"
                        >
                          {[0, 3, 6, 12, 24].map(m => (
                            <option key={m} value={m}>{m}개월</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={addon.hasMinimumPrice}
                            onChange={(e) => {
                              updateAddOn(addon.id, 'hasMinimumPrice', e.target.checked);
                              if (e.target.checked) {
                                updateAddOn(addon.id, 'minimumPrice', 0);
                              }
                            }}
                            className="scale-75"
                          />
                          <span>사용안함</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 단말기 할부 */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <h3 className="text-base font-semibold text-gray-800 mb-3">단말기 할부</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <span className="w-12 text-xs">할부원금:</span>
                  <input
                    type="number"
                    value={devicePrice}
                    onChange={(e) => setDevicePrice(Number(e.target.value) || 0)}
                    className="flex-1 px-1 py-1 border rounded text-xs"
                    placeholder="원"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-12 text-xs">할부기간:</span>
                  <select
                    value={installMonths}
                    onChange={(e) => setInstallMonths(Number(e.target.value))}
                    className="flex-1 px-1 py-1 border rounded text-xs"
                  >
                    {[0, 6, 12, 24, 36].map(m => (
                      <option key={m} value={m}>{m}개월</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-gray-600 pt-1">
                  월 할부금: <span className="font-semibold">{deviceMonthly.toLocaleString()}원</span>
                </div>
              </div>
            </div>
            </div>

          {/* 우측: 시각화 영역 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 비용 상세 정보 - 최상위로 이동 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">연간 총비용 상세</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {selectedPlanIds.map((id) => {
                  const plan = userPlans.find((p) => p.id === id);
                  if (!plan) return null;
                  
                  const total = totalYearCost(id);
                  const regularCost = plan.monthlyFee * 12;
                  const minimumCost = plan.hasMinimumPrice ? 
                    (plan.monthlyFee * plan.minimumContract) + (plan.minimumPrice * (12 - plan.minimumContract)) : regularCost;
                  const addOnsCost = selectedAddOns.reduce((sum, addon) => {
                    return sum + (addon.hasMinimumPrice ? 
                      (addon.monthlyFee * addon.minimumContract) + (addon.minimumPrice * (12 - addon.minimumContract)) :
                      addon.monthlyFee * 12);
                  }, 0);
                  const deviceCost = devicePrice;
                  
                  return (
                    <div key={id} className="p-3 border rounded bg-gray-50">
                      <div className="font-bold text-sm mb-2">{plan.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>요금제 비용:</span>
                          <span>{minimumCost.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>부가서비스:</span>
                          <span>{addOnsCost.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>단말기 할부:</span>
                          <span>{deviceCost.toLocaleString()}원</span>
                        </div>
                        <hr className="my-1" />
                        <div className="flex justify-between font-bold text-blue-600 text-sm">
                          <span>총 비용:</span>
                          <span>{total.toLocaleString()}원</span>
                        </div>
                        {plan.hasMinimumPrice && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ {plan.minimumContract}개월 후 다른 요금제 적용
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 차트 섹션 - 2:1 비율로 배치 */}
            <div className="grid grid-cols-3 gap-4">
              {/* 월별 비용 추이 - 2/3 너비 */}
              <div className="col-span-2 bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3">월별 비용 추이</h3>
                <div style={{ height: '280px' }}>
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: { size: 11 }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}원`,
                            afterLabel: (context) => {
                              const monthIndex = context.dataIndex;
                              const plan = userPlans.find(p => selectedPlanIds.includes(p.id));
                              if (!plan) return '';
                              
                              const planFee = (monthIndex >= plan.minimumContract && plan.hasMinimumPrice) ? 
                                plan.minimumPrice : plan.monthlyFee;
                              const addOnsFee = selectedAddOns.reduce((sum, addon) => {
                                const addonFee = (monthIndex >= addon.minimumContract && addon.hasMinimumPrice) ? 
                                  addon.minimumPrice : addon.monthlyFee;
                                return sum + addonFee;
                              }, 0);
                              const deviceFee = monthIndex < installMonths ? deviceMonthly : 0;
                              
                              return [
                                `요금제: ${planFee.toLocaleString()}원`,
                                `부가서비스: ${addOnsFee.toLocaleString()}원`,
                                `단말기: ${deviceFee.toLocaleString()}원`
                              ];
                            }
                          }
                        }
                      },
                      interaction: { mode: 'index', intersect: false },
                      scales: { 
                        y: { 
                          ticks: { 
                            callback: (v) => v.toLocaleString() + '원',
                            font: { size: 10 }
                          },
                          grid: { color: '#f3f4f6' }
                        },
                        x: {
                          ticks: { font: { size: 10 } },
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* 총비용 비교 바 차트 - 1/3 너비 */}
              <div className="col-span-1 bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3">연간 총비용 비교</h3>
                <div style={{ height: '280px' }}>
                  <Bar 
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `총 비용: ${context.parsed.y.toLocaleString()}원`
                          }
                        }
                      },
                      scales: { 
                        y: { 
                          ticks: { 
                            callback: (v) => v.toLocaleString() + '원',
                            font: { size: 10 }
                          },
                          grid: { color: '#f3f4f6' }
                        },
                        x: {
                          ticks: {
                            maxRotation: 0,
                            minRotation: 0,
                            font: { size: 10 }
                          },
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonPage;

