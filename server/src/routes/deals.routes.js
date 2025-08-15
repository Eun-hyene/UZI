'use strict';
const { Router } = require('express');
const { ok, fail } = require('../utils/response');
const { parseSellerType, parseStorageGb } = require('../utils/validators');
const dealService = require('../services/deal.service');

const router = Router();

// GET /api/v1/deals?model_slug=...&storage=128GB&seller_type=all|online|offline|official
router.get('/', async (req, res) => {
  try {
    const modelSlug = req.query.model_slug;
    const storageGb = parseStorageGb(req.query.storage);
    const sellerType = parseSellerType(req.query.seller_type || 'all');
    if (!modelSlug || !storageGb) {
      return fail(res, 'BAD_REQUEST', 'model_slug and storage are required', 400);
    }
    const data = await dealService.getDeals({ modelSlug, storageGb, sellerType });
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

// GET /api/v1/deals/top?limit=10&seller_type=all|online|offline|official
router.get('/top', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const sellerType = parseSellerType(req.query.seller_type || 'all');
    const data = await dealService.getTopDeals({ limit, sellerType });
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

module.exports = router;


