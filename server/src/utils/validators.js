'use strict';

function parseIntOr(value, def) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : def;
}

function parseFloatOr(value, def) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : def;
}

function parseBool(value, def = false) {
  if (value === undefined || value === null) return def;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  if (['1', 'true', 'yes', 'y'].includes(s)) return true;
  if (['0', 'false', 'no', 'n'].includes(s)) return false;
  return def;
}

function parseSellerType(value) {
  const t = String(value || 'all').toLowerCase();
  return ['online', 'offline', 'official', 'all'].includes(t) ? t : 'all';
}

function parseStorageGb(storage) {
  if (!storage) return null;
  const m = String(storage).match(/(\d+)\s*gb/i);
  return m ? Number(m[1]) : null;
}

module.exports = { parseIntOr, parseFloatOr, parseBool, parseSellerType, parseStorageGb };


