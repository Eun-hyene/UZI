// 간단한 요금제 더미 데이터
export const plans = [
  {
    id: 'plan_basic_10',
    name: '베이직 10GB',
    monthlyFee: 29000,
    dataCapGB: 10,
    overageType: 'charge', // 초과 데이터 과금
    overagePerGB: 3000,
    voiceIncludedMinutes: 200,
    voiceOveragePerMin: 1 * 100, // 100원/분
    notes: ['데이터 쉐어 1회선']
  },
  {
    id: 'plan_standard_20',
    name: '스탠다드 20GB',
    monthlyFee: 39000,
    dataCapGB: 20,
    overageType: 'charge',
    overagePerGB: 2500,
    voiceIncludedMinutes: 400,
    voiceOveragePerMin: 80,
    notes: ['미디어 데이터 5GB 추가 제공']
  },
  {
    id: 'plan_unlimited',
    name: '무제한(속도제한)',
    monthlyFee: 49000,
    dataCapGB: 30,
    overageType: 'throttle', // 초과 시 속도제한, 추가 과금 없음
    overagePerGB: 0,
    voiceIncludedMinutes: 1000,
    voiceOveragePerMin: 50,
    notes: ['30GB 이후 3Mbps']
  },
  {
    id: 'plan_lite_5',
    name: '라이트 5GB',
    monthlyFee: 19000,
    dataCapGB: 5,
    overageType: 'charge',
    overagePerGB: 3500,
    voiceIncludedMinutes: 100,
    voiceOveragePerMin: 120,
    notes: []
  }
];

// 부가서비스: { id, name, monthlyFee }
export const defaultAddOns = [
  { id: 'addon_music', name: '뮤직 스트리밍', monthlyFee: 5000 },
  { id: 'addon_cloud', name: '클라우드 200GB', monthlyFee: 3000 },
  { id: 'addon_security', name: '휴대폰 보안', monthlyFee: 2000 }
];

export const estimateMonthlyCost = ({ plan, dataUsageGB, voiceMinutes, deviceMonthly = 0, addOns = [] }) => {
  let dataOverage = 0;
  if (plan.overageType === 'charge' && plan.dataCapGB != null) {
    const over = Math.max(0, dataUsageGB - plan.dataCapGB);
    dataOverage = Math.ceil(over) * plan.overagePerGB;
  }
  // throttle/unlimited은 초과 과금 없음
  const voiceOverage = Math.max(0, voiceMinutes - (plan.voiceIncludedMinutes || 0)) * (plan.voiceOveragePerMin || 0);
  const addOnsFee = addOns.reduce((sum, a) => sum + (a.monthlyFee || 0), 0);
  return plan.monthlyFee + dataOverage + voiceOverage + deviceMonthly + addOnsFee;
};

