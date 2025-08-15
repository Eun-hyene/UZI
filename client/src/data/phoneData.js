// 휴대폰 모델 데이터
export const phoneModels = {
  galaxy: [
    {
      id: 'galaxy-s25',
      name: 'Galaxy S25',
      brand: 'Samsung',
      series: 'Galaxy S',
      releaseDate: '2025-01-15',
      imageUrl: '/images/galaxy-s25.png',
      specs: {
        display: '6.2인치',
        camera: '50MP',
        battery: '4000mAh',
        processor: 'Snapdragon 8 Gen 4'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue'],
          officialPrice: 1150000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue', 'green'],
          officialPrice: 1250000
        },
        {
          storage: '512GB',
          colors: ['black', 'white'],
          officialPrice: 1450000
        }
      ],
      averagePrice: 1150000
    },
    {
      id: 'galaxy-s24',
      name: 'Galaxy S24',
      brand: 'Samsung',
      series: 'Galaxy S',
      releaseDate: '2024-01-17',
      imageUrl: '/images/galaxy-s24.png',
      specs: {
        display: '6.2인치',
        camera: '50MP',
        battery: '4000mAh',
        processor: 'Snapdragon 8 Gen 3'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue'],
          officialPrice: 1050000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue', 'green'],
          officialPrice: 1150000
        }
      ],
      averagePrice: 1050000
    },
    {
      id: 'galaxy-a55',
      name: 'Galaxy A55',
      brand: 'Samsung',
      series: 'Galaxy A',
      releaseDate: '2024-03-15',
      imageUrl: '/images/galaxy-a55.png',
      specs: {
        display: '6.6인치',
        camera: '50MP',
        battery: '5000mAh',
        processor: 'Exynos 1480'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue'],
          officialPrice: 650000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue'],
          officialPrice: 750000
        }
      ],
      averagePrice: 650000
    }
  ],
  iphone: [
    {
      id: 'iphone-15-pro',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      series: 'iPhone Pro',
      releaseDate: '2024-09-22',
      imageUrl: '/images/iphone-15-pro.png',
      specs: {
        display: '6.1인치',
        camera: '48MP',
        battery: '3274mAh',
        processor: 'A17 Pro'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue', 'natural'],
          officialPrice: 1550000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue', 'natural'],
          officialPrice: 1700000
        },
        {
          storage: '512GB',
          colors: ['black', 'white', 'blue', 'natural'],
          officialPrice: 2000000
        }
      ],
      averagePrice: 1550000
    },
    {
      id: 'iphone-15',
      name: 'iPhone 15',
      brand: 'Apple',
      series: 'iPhone',
      releaseDate: '2024-09-22',
      imageUrl: '/images/iphone-15.png',
      specs: {
        display: '6.1인치',
        camera: '48MP',
        battery: '3349mAh',
        processor: 'A16 Bionic'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue', 'green', 'pink'],
          officialPrice: 1250000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue', 'green', 'pink'],
          officialPrice: 1400000
        }
      ],
      averagePrice: 1250000
    },
    {
      id: 'iphone-14',
      name: 'iPhone 14',
      brand: 'Apple',
      series: 'iPhone',
      releaseDate: '2023-09-16',
      imageUrl: '/images/iphone-14.png',
      specs: {
        display: '6.1인치',
        camera: '12MP',
        battery: '3240mAh',
        processor: 'A15 Bionic'
      },
      variants: [
        {
          storage: '128GB',
          colors: ['black', 'white', 'blue', 'purple'],
          officialPrice: 1050000
        },
        {
          storage: '256GB',
          colors: ['black', 'white', 'blue', 'purple'],
          officialPrice: 1200000
        }
      ],
      averagePrice: 1050000
    }
  ]
};

// 판매처 데이터
export const sellers = [
  {
    id: 'seller_001',
    name: '온라인몰A',
    type: 'online',
    rating: 4.5,
    logoUrl: '/logos/seller-a.png',
    conditions: ['무이자 12개월 할부', '당일 출고', '무료 배송']
  },
  {
    id: 'seller_002',
    name: '휴대폰 대리점 B',
    type: 'offline',
    rating: 4.2,
    address: '서울시 강남구 테헤란로 123',
    coordinates: { lat: 37.5665, lng: 126.9780 },
    distance: 500,
    businessHours: '09:00-21:00',
    conditions: ['현장 할인', '케이스 무료 증정']
  },
  {
    id: 'seller_003',
    name: '공식 스토어',
    type: 'official',
    rating: 4.8,
    logoUrl: '/logos/official-store.png',
    conditions: ['공식 보증', '무료 교환', '정품 보장']
  }
];

// 가격 데이터 생성 함수
export const generatePriceData = (modelId, variant) => {
  const model = [...phoneModels.galaxy, ...phoneModels.iphone].find(m => m.id === modelId);
  if (!model) return [];

  const basePrice = variant.officialPrice;
  
  return sellers.map(seller => {
    let price = basePrice;
    let discount = 0;
    
    // 판매처별 가격 차이 적용
    switch (seller.type) {
      case 'online':
        discount = Math.floor(basePrice * 0.08); // 8% 할인
        break;
      case 'offline':
        discount = Math.floor(basePrice * 0.15); // 15% 할인
        break;
      case 'official':
        discount = Math.floor(basePrice * 0.02); // 2% 할인
        break;
      default:
        discount = 0; // 기본값
        break;
    }
    
    price = basePrice - discount;
    
    return {
      id: `price_${seller.id}_${modelId}`,
      sellerId: seller.id,
      seller: seller,
      price: price,
      originalPrice: basePrice,
      discount: discount,
      conditions: seller.conditions,
      stockStatus: true,
      shippingCost: seller.type === 'online' ? 0 : null,
      estimatedDelivery: seller.type === 'online' ? '1-2일' : null,
      purchaseUrl: seller.type === 'online' ? `https://${seller.name.toLowerCase()}.com/${modelId}` : null,
      contactNumber: seller.type === 'offline' ? '02-1234-5678' : null,
      updatedAt: new Date().toISOString()
    };
  });
}; 