'use strict';
const pool = require('../db');

function isOpenNowStr(businessHours) {
  if (!businessHours) return true;
  const [open, close] = String(businessHours).split('-').map((s) => s.trim());
  if (!open || !close) return true;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = (t) => {
    const [h, m] = t.split(':').map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const start = toMin(open);
  const end = toMin(close);
  if (end >= start) return cur >= start && cur <= end;
  return cur >= start || cur <= end;
}

async function getNearbyStores({ lat, lng, radius, minPrice, maxPrice, minRating, openNow }) {
  // 기본: offline 매장만
  const [rows] = await pool.query(
    `SELECT s.*, MIN(pq.price) AS best_price,
            ANY_VALUE(pm.model_slug) AS any_model_slug,
            ANY_VALUE(pm.model_name) AS any_model_name,
            ANY_VALUE(pm.storage_gb) AS any_storage,
            ANY_VALUE(pm.release_price) AS any_release_price
     FROM stores s
     JOIN price_quotes pq ON pq.store_id = s.store_id
     JOIN phone_models pm ON pm.model_id = pq.model_id
     WHERE s.store_type = 'offline'
     GROUP BY s.store_id`,
    {}
  );

  // 좌표 필터 및 조건 필터(메모리, 매장 수가 많지 않다는 가정 하 클린 처리)
  const EARTH_R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const haversine = (lat1, lon1, lat2, lon2) => {
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_R * c;
  };

  const filtered = rows
    .filter((r) => r.latitude && r.longitude)
    .map((r) => {
      const distance = haversine(lat, lng, Number(r.latitude), Number(r.longitude));
      return { ...r, _distance: distance };
    })
    .filter((r) => r._distance <= radius)
    .filter((r) => (minRating ? (r.review_rating || 0) >= minRating : true))
    .filter((r) => (openNow ? isOpenNowStr(r.operating_hours) : true))
    .filter((r) => (minPrice ? r.best_price >= minPrice : true))
    .filter((r) => (maxPrice ? r.best_price <= maxPrice : true))
    .sort((a, b) => a._distance - b._distance)
    .slice(0, 300);

  const data = filtered.map((r) => ({
    store: {
      id: r.store_id,
      name: r.store_name,
      rating: r.review_rating,
      address: r.address,
      coordinates: { lat: Number(r.latitude), lng: Number(r.longitude) },
      businessHours: r.operating_hours || null
    },
    bestDeal: {
      model: { slug: r.any_model_slug, name: r.any_model_name, storage: `${r.any_storage}GB` },
      price: r.best_price,
      originalPrice: r.any_release_price
    },
    distanceMeters: r._distance
  }));

  return data;
}

module.exports = { getNearbyStores };


