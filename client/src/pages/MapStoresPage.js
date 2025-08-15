import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Target, LocateFixed, SlidersHorizontal } from 'lucide-react';
import { sellers, phoneModels, generatePriceData } from '../data/phoneData';
import { geocodeAddress } from '../utils/naverApiClient';
import { formatPrice, formatDistance, haversineDistance } from '../utils/helpers';
import { loadNaverMaps } from '../utils/naverMapsLoader';

// 네이버 지도 클라이언트 ID는 환경변수 또는 상수에서 로드합니다.
const NAVER_MAP_CLIENT_ID = process.env.REACT_APP_NAVER_MAP_CLIENT_ID || 'akcg5g0b7c';

const defaultCenter = { lat: 37.5665, lng: 126.9780 }; // 서울시청 근방

const MapStoresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [naverMaps, setNaverMaps] = useState(null);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [center, setCenter] = useState(defaultCenter);
  const [radius, setRadius] = useState(Number(searchParams.get('radius')) || 1000);
  const [selectedModelId, setSelectedModelId] = useState(searchParams.get('model') || 'galaxy-s25');
  const [variantStorage, setVariantStorage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [viewBoundsOnly, setViewBoundsOnly] = useState(searchParams.get('boundsOnly') === 'true');
  const [autoRadius, setAutoRadius] = useState(searchParams.get('autoRadius') === 'true');
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 0);
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating')) || 0);
  const [openNow, setOpenNow] = useState(searchParams.get('openNow') === 'true');
  const [scopeMode, setScopeMode] = useState(searchParams.get('scope') === 'single' ? 'single' : 'all'); // 'all' | 'single'
  const [brandFilter, setBrandFilter] = useState({
    galaxy: searchParams.get('galaxy') !== 'false',
    iphone: searchParams.get('iphone') !== 'false'
  });

  // 선택한 모델 정보 및 가격 데이터 생성
  const selectedModel = useMemo(() => {
    const all = [...phoneModels.galaxy, ...phoneModels.iphone];
    return all.find((m) => m.id === selectedModelId) || all[0];
  }, [selectedModelId]);

  const selectedVariant = useMemo(() => {
    if (!selectedModel) return null;
    const storage = variantStorage || selectedModel.variants[0].storage;
    return selectedModel.variants.find((v) => v.storage === storage) || selectedModel.variants[0];
  }, [selectedModel, variantStorage]);

  // 후보 모델 집합 (브랜드 필터 + 범위 모드)
  const candidateModels = useMemo(() => {
    const list = [];
    if (brandFilter.galaxy) list.push(...phoneModels.galaxy);
    if (brandFilter.iphone) list.push(...phoneModels.iphone);
    if (scopeMode === 'single') {
      return list.filter((m) => m.id === selectedModel?.id);
    }
    return list;
  }, [brandFilter, scopeMode, selectedModel]);

  // 모든 후보 모델/변형의 가격 데이터 생성
  const allDeals = useMemo(() => {
    const acc = [];
    candidateModels.forEach((m) => {
      const variants = scopeMode === 'single' && selectedVariant ? [selectedVariant] : m.variants;
      variants.forEach((v) => {
        const arr = generatePriceData(m.id, v);
        arr.forEach((p) => acc.push({ ...p, model: m, variant: v }));
      });
    });
    return acc;
  }, [candidateModels, scopeMode, selectedVariant]);

  // 오프라인만 추출 후 매장(판매처)별 최저가 집계
  const offlineByStoreBest = useMemo(() => {
    const map = new Map();
    allDeals
      .filter((d) => d.seller.type === 'offline')
      .forEach((d) => {
        const key = d.sellerId || d.seller.id;
        const prev = map.get(key);
        if (!prev || d.price < prev.price) {
          map.set(key, d);
        }
      });
    return Array.from(map.values());
  }, [allDeals]);

  // 동적 가격 범위 기본값 계산
  const computedPriceRange = useMemo(() => {
    if (offlineByStoreBest.length === 0) return { min: 0, max: 0 };
    const prices = offlineByStoreBest.map((d) => d.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [offlineByStoreBest]);

  useEffect(() => {
    // 초기 세팅 또는 데이터 변경 시 상한 기본값 보정
    if (!maxPrice || maxPrice < computedPriceRange.min || maxPrice > computedPriceRange.max) {
      setMaxPrice(computedPriceRange.max);
    }
    if (!minPrice || minPrice < 0 || minPrice > computedPriceRange.max) {
      setMinPrice(computedPriceRange.min);
    }
  }, [computedPriceRange.min, computedPriceRange.max]);

  // 개장 여부 판단
  const isStoreOpenNow = (businessHours) => {
    if (!businessHours) return true; // 정보 없으면 필터 통과 처리
    const [open, close] = businessHours.split('-');
    if (!open || !close) return true;
    const now = new Date();
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map((n) => parseInt(n, 10));
      return h * 60 + (m || 0);
    };
    const cur = now.getHours() * 60 + now.getMinutes();
    const start = toMinutes(open.trim());
    const end = toMinutes(close.trim());
    if (end >= start) return cur >= start && cur <= end;
    // 익일 새벽까지 영업 케이스
    return cur >= start || cur <= end;
  };

  // 지도 이동/줌 이벤트 처리 (반경 자동 보정 및 재계산 트리거)
  useEffect(() => {
    if (!naverMaps || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const onIdle = () => {
      const c = map.getCenter();
      setCenter({ lat: c.lat(), lng: c.lng() });
      const z = map.getZoom();
      setMapZoom(z);
      if (autoRadius) {
        try {
          const b = map.getBounds();
          const ne = b.getNE();
          const d = haversineDistance(c.lat(), c.lng(), ne.lat(), ne.lng());
          setRadius(Math.max(300, Math.round(d)));
        } catch {}
      }
    };

    const idleListener = naverMaps.Event.addListener(map, 'idle', onIdle);
    return () => {
      naverMaps.Event.removeListener(idleListener);
    };
  }, [naverMaps, autoRadius]);

  // 사용자 위치 가져오기 (옵션)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
        setCenter({ lat: latitude, lng: longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // 네이버 지도 로드 (ncpKeyId 사용)
  useEffect(() => {
    let isMounted = true;
    loadNaverMaps(NAVER_MAP_CLIENT_ID)
      .then((maps) => {
        if (!isMounted) return;
        setNaverMaps(maps);
        setMapError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err && String(err).includes('NAVER_MAPS_AUTH_FAILED')) {
          setMapError('네이버 지도 인증에 실패했습니다. 콘솔 서비스 URL과 Client ID를 확인하세요.');
        } else if (err && String(err).includes('NAVER_MAPS_LOAD_TIMEOUT')) {
          setMapError('네이버 지도 로딩이 지연되고 있습니다. 네트워크 상태를 확인하거나 새로고침 해주세요.');
        } else {
          setMapError(err?.message || '지도를 불러올 수 없습니다. 인증 정보를 확인하세요.');
        }
      })
      .finally(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  // 지도 초기화 및 마커 렌더링
  useEffect(() => {
    if (!naverMaps || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new naverMaps.Map(mapRef.current, {
          center: new naverMaps.LatLng(center.lat, center.lng),
          zoom: 14,
        });
      } catch (e) {
        setMapError('지도 초기화에 실패했습니다. 인증 및 서비스 URL을 확인하세요.');
        return;
      }
    } else {
      mapInstanceRef.current.setCenter(new naverMaps.LatLng(center.lat, center.lng));
    }

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 반경 원 표시 (boundsOnly가 아닐 때만 표시)
    if (markersRef.current.circle) {
      markersRef.current.circle.setMap(null);
    }
    if (!viewBoundsOnly) {
      const circle = new naverMaps.Circle({
        map: mapInstanceRef.current,
        center: new naverMaps.LatLng(center.lat, center.lng),
        radius: radius,
        strokeColor: '#2563eb',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
      });
      markersRef.current.circle = circle;
    }

    // 좌표 없는 매장 주소 지오코딩 → 임시 좌표 보강
    const withCoordsPromises = offlineByStoreBest.map(async (item) => {
      const s = item.seller;
      if (s.coordinates) return item;
      if (!s.address) return null;
      try {
        const data = await geocodeAddress(s.address);
        const addr = data?.addresses?.[0];
        if (addr && addr.y && addr.x) {
          s.coordinates = { lat: parseFloat(addr.y), lng: parseFloat(addr.x) };
          return item;
        }
      } catch {}
      return null;
    });

    Promise.all(withCoordsPromises).then((enriched) => {
      const valid = enriched.filter(Boolean);
      // 반경/영역/가격/평점/영업중 필터
      const within = valid.filter((item) => {
        const s = item.seller;
        if (!s.coordinates) return false;
        // 뷰포트 내 여부
        if (viewBoundsOnly) {
          try {
            const b = mapInstanceRef.current.getBounds();
            const latlng = new naverMaps.LatLng(s.coordinates.lat, s.coordinates.lng);
            if (!b.hasLatLng(latlng)) return false;
          } catch {}
        } else {
          const d = haversineDistance(center.lat, center.lng, s.coordinates.lat, s.coordinates.lng);
          if (d > radius) return false;
        }
        // 가격
        if ((minPrice && item.price < minPrice) || (maxPrice && item.price > maxPrice)) return false;
        // 평점
        if (minRating && (s.rating || 0) < minRating) return false;
        // 영업중
        if (openNow && !isStoreOpenNow(s.businessHours)) return false;
        return true;
      });

      within.forEach((item) => {
      const { seller } = item;
      const marker = new naverMaps.Marker({
        position: new naverMaps.LatLng(seller.coordinates.lat, seller.coordinates.lng),
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:6px 8px;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.1);white-space:nowrap;">${seller.name}<br/><strong style="color:#2563eb;">${formatPrice(item.price)}</strong></div>`,
          size: new naverMaps.Size(120, 40),
          anchor: new naverMaps.Point(60, 40),
        },
      });

      const contentHtml = `
        <div style="padding:8px 10px;min-width:220px;">
          <div style="font-weight:700;margin-bottom:4px;">${seller.name}</div>
          <div style="margin-bottom:4px;">가격: <strong>${formatPrice(item.price)}</strong> <span style="color:#6b7280;font-size:12px;">(출고가 ${formatPrice(item.originalPrice)})</span></div>
          <div style="margin-bottom:6px;font-size:12px;color:#6b7280;">주소: ${seller.address || '-'}</div>
          <div style="display:flex;gap:8px;">
            <a href="#" target="_blank" style="color:#2563eb;font-weight:600;">상담/구매 문의</a>
            <a href="https://map.naver.com/p/search/${encodeURIComponent(seller.address || seller.name)}" target="_blank" style="color:#10b981;font-weight:600;">길찾기</a>
          </div>
        </div>
      `;
      const infoWindow = new naverMaps.InfoWindow({
        content: contentHtml,
        backgroundColor: '#fff',
        borderWidth: 1,
        anchorSize: new naverMaps.Size(8, 8),
      });

      naverMaps.Event.addListener(marker, 'click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

        markersRef.current.push(marker);
      });
    });
  }, [naverMaps, center, radius, offlineByStoreBest]);

  // URL 동기화
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('radius', String(radius));
    next.set('model', selectedModelId);
    next.set('scope', scopeMode);
    next.set('galaxy', String(brandFilter.galaxy));
    next.set('iphone', String(brandFilter.iphone));
    setSearchParams(next, { replace: true });
    next.set('boundsOnly', String(viewBoundsOnly));
    next.set('autoRadius', String(autoRadius));
    next.set('minPrice', String(minPrice));
    next.set('maxPrice', String(maxPrice));
    next.set('minRating', String(minRating));
    next.set('openNow', String(openNow));
    setSearchParams(next, { replace: true });
  }, [radius, selectedModelId, scopeMode, brandFilter, viewBoundsOnly, autoRadius, minPrice, maxPrice, minRating, openNow]);

  return (
    <div className="min-h-screen bg-background-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-text-800">우리동네 휴대폰성지</h1>
        </div>

        {mapError && (
          <div className="mb-4 p-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
            지도 로딩 오류: {mapError}
            <div className="mt-1 text-red-600">Naver Cloud Console에서 서비스 URL에 현재 도메인을 정확히 등록했는지 확인하세요. (예: http://localhost:3000)</div>
          </div>
        )}

        {/* Zigbang-like 레이아웃: 좌측 필터, 우측 대형 지도 */}
        <div className="flex gap-4">
          {/* Sidebar */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold"><SlidersHorizontal className="w-4 h-4" /> 필터</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">범위</div>
                    <div className="flex gap-2">
                      {[500, 1000, 2000, 3000].map((r) => (
                        <button
                          key={r}
                          className={`px-3 py-1.5 rounded-lg border text-sm ${radius === r ? 'bg-primary-50 text-primary-700 border-primary-200' : 'border-gray-300 text-gray-700'}`}
                          onClick={() => setRadius(r)}
                        >
                          {formatDistance(r)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={5000}
                      step={100}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="mt-3 w-full"
                    />
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">브랜드</div>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="inline-flex items-center gap-1">
                        <input type="checkbox" checked={brandFilter.galaxy} onChange={(e) => setBrandFilter((s) => ({ ...s, galaxy: e.target.checked }))} />
                        <span>Galaxy</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input type="checkbox" checked={brandFilter.iphone} onChange={(e) => setBrandFilter((s) => ({ ...s, iphone: e.target.checked }))} />
                        <span>iPhone</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">가격 범위</div>
                    <div className="flex items-center gap-2">
                      <input type="number" className="w-28 px-2 py-1 border rounded" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} />
                      <span className="text-gray-500">~</span>
                      <input type="number" className="w-28 px-2 py-1 border rounded" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">기본: {computedPriceRange.min.toLocaleString()} ~ {computedPriceRange.max.toLocaleString()}원</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">최소 평점</div>
                    <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full" />
                    <div className="text-xs text-gray-600 mt-1">{minRating} 이상</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} />
                      <span>영업중만</span>
                    </label>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">모델 범위</div>
                    <div className="flex items-center gap-4 text-sm">
                      <label className="inline-flex items-center gap-1">
                        <input type="radio" name="scope" checked={scopeMode === 'all'} onChange={() => setScopeMode('all')} /> 전체 모델
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input type="radio" name="scope" checked={scopeMode === 'single'} onChange={() => setScopeMode('single')} /> 특정 모델
                      </label>
                    </div>
                    {scopeMode === 'single' && (
                      <div className="mt-2">
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={selectedModelId}
                          onChange={(e) => setSelectedModelId(e.target.value)}
                        >
                          {[...phoneModels.galaxy, ...phoneModels.iphone].map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        {selectedModel && (
                          <select
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={selectedVariant?.storage || ''}
                            onChange={(e) => setVariantStorage(e.target.value)}
                          >
                            {selectedModel.variants.map((v) => (
                              <option key={v.storage} value={v.storage}>{v.storage}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-sm text-gray-600">지도 조작</div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-2 border rounded text-sm flex items-center gap-1"
                    onClick={() => userPosition && setCenter(userPosition)}
                  >
                    <LocateFixed className="w-4 h-4" /> 내 위치로 이동
                  </button>
                  <button
                    className="px-3 py-2 border rounded text-sm flex items-center gap-1"
                    onClick={() => setCenter(defaultCenter)}
                  >
                    <Target className="w-4 h-4" /> 기본 위치
                  </button>
                </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={autoRadius} onChange={(e) => setAutoRadius(e.target.checked)} />
              <span>줌/이동시 반경 자동</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={viewBoundsOnly} onChange={(e) => setViewBoundsOnly(e.target.checked)} />
              <span>보이는 영역만</span>
            </label>
          </div>
              </div>
            </div>
          </aside>

          {/* Map */}
          <div className="flex-1">
            <div ref={mapRef} className="w-full h-[calc(100vh-120px)] rounded-xl border border-gray-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapStoresPage;

