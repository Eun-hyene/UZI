'use strict';
const { Router } = require('express');
const { ok, fail } = require('../utils/response');
const { parseFloatOr, parseIntOr, parseBool } = require('../utils/validators');
const storeService = require('../services/store.service');
const { authenticateToken, requireLocationAccess } = require('../middleware/auth.middleware');

const router = Router();

// GET /api/v1/stores/nearby?lat=&lng=&radius=&minPrice=&maxPrice=&minRating=&openNow=
// 우리동네 기능은 로그인이 필요함
router.get('/nearby', authenticateToken, requireLocationAccess, async (req, res) => {
  try {
    const lat = parseFloatOr(req.query.lat, null);
    const lng = parseFloatOr(req.query.lng, null);
    const radius = parseIntOr(req.query.radius, 1000);
    const minPrice = parseIntOr(req.query.minPrice, 0);
    const maxPrice = parseIntOr(req.query.maxPrice, 0);
    const minRating = parseFloatOr(req.query.minRating, 0);
    const openNow = parseBool(req.query.openNow, false);
    if (lat == null || lng == null) {
      return fail(res, 'BAD_REQUEST', 'lat and lng are required', 400);
    }
    const data = await storeService.getNearbyStores({ lat, lng, radius, minPrice, maxPrice, minRating, openNow });
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

module.exports = router;


