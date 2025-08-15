'use strict';
const pool = require('../db');

const BRAND_TO_MANUFACTURER = { galaxy: 'Samsung', iphone: 'Apple' };

async function getModelsByBrand(brand) {
  const manufacturer = BRAND_TO_MANUFACTURER[brand];
  const [rows] = await pool.query(
    'SELECT * FROM v_models_aggregated WHERE manufacturer = :mfg',
    { mfg: manufacturer }
  );
  return rows.map((r) => ({
    id: r.model_slug,
    name: r.model_name,
    brand: r.manufacturer,
    series: r.series || '',
    averagePrice: r.min_price,
    variants: JSON.parse(r.variants || '[]')
  }));
}

async function getModelBySlug(slug) {
  const [rows] = await pool.query(
    'SELECT * FROM v_models_aggregated WHERE model_slug = :slug',
    { slug }
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.model_slug,
    name: r.model_name,
    brand: r.manufacturer,
    series: r.series || '',
    averagePrice: r.min_price,
    variants: JSON.parse(r.variants || '[]')
  };
}

module.exports = { getModelsByBrand, getModelBySlug };


