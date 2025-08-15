'use strict';
const pool = require('../db');

function rowToDeal(r) {
  const conditions = [];
  if (r.has_card_condition) conditions.push('제휴카드');
  if (r.has_internet_condition) conditions.push('인터넷/TV 결합');
  if (r.has_trade_in_condition) conditions.push('기기반납');
  if (r.has_extra_services_yn === 'Y') conditions.push('부가서비스');
  if (r.required_plan) conditions.push(r.required_plan);
  if (r.notes) conditions.push(r.notes);

  const today = new Date().toISOString().slice(0, 10);
  const stock = r.quote_date && String(r.quote_date).slice(0, 10) === today;

  return {
    id: `price_${r.store_id}_${r.model_slug}_${r.storage_gb}`,
    sellerId: r.store_id,
    seller: {
      id: r.store_id,
      name: r.store_name,
      type: r.store_type,
      rating: r.review_rating,
      address: r.address,
      coordinates: r.latitude && r.longitude ? { lat: Number(r.latitude), lng: Number(r.longitude) } : null,
      businessHours: r.operating_hours || null
    },
    price: r.price,
    originalPrice: r.release_price,
    discount: Math.max(0, r.release_price - r.price),
    conditions,
    stockStatus: stock,
    shippingCost: r.store_type === 'online' ? 0 : null,
    estimatedDelivery: r.store_type === 'online' ? '1-2일' : null,
    purchaseUrl: r.store_type !== 'offline' ? r.source_url : null,
    contactNumber: r.store_type === 'offline' ? (r.contact_number || null) : null,
    updatedAt: r.updated_at
  };
}

async function getDeals({ modelSlug, storageGb, sellerType }) {
  const [rows] = await pool.query(
    `SELECT * FROM v_deals
     WHERE model_slug = :slug AND storage_gb = :gb
       AND (:stype = 'all' OR store_type = :stype)`,
    { slug: modelSlug, gb: storageGb, stype: sellerType }
  );
  const data = rows.map(rowToDeal).sort((a, b) => a.price - b.price);
  return data;
}

async function getTopDeals({ limit, sellerType }) {
  const [rows] = await pool.query(
    `SELECT * FROM v_deals
     WHERE (:stype = 'all' OR store_type = :stype)
     ORDER BY price ASC
     LIMIT :lim`,
    { stype: sellerType, lim: Number(limit) }
  );
  return rows.map(rowToDeal);
}

module.exports = { getDeals, getTopDeals };


