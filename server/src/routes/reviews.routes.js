'use strict';
const { Router } = require('express');
const { ok, fail } = require('../utils/response');
const reviewService = require('../services/review.service');

const router = Router();

// GET /api/v1/reviews?store_id=2
router.get('/', async (req, res) => {
  try {
    const storeId = parseInt(req.query.store_id, 10);
    if (!Number.isFinite(storeId)) return fail(res, 'BAD_REQUEST', 'store_id is required', 400);
    const data = await reviewService.getReviewsByStore(storeId);
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

// POST /api/v1/reviews
router.post('/', async (req, res) => {
  try {
    const { store_id, user_id = null, rating, comment } = req.body || {};
    if (!store_id || !rating) return fail(res, 'BAD_REQUEST', 'store_id and rating are required', 400);
    const item = await reviewService.createReview({ store_id, user_id, rating, comment });
    return ok(res, item);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

module.exports = router;


