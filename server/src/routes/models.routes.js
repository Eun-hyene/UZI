'use strict';
const { Router } = require('express');
const { ok, fail } = require('../utils/response');
const modelService = require('../services/model.service');

const router = Router();

// GET /api/v1/models?brand=galaxy|iphone
router.get('/', async (req, res) => {
  try {
    const brand = String(req.query.brand || '').toLowerCase();
    if (!['galaxy', 'iphone'].includes(brand)) {
      return fail(res, 'BAD_REQUEST', 'brand must be galaxy or iphone', 400);
    }
    const data = await modelService.getModelsByBrand(brand);
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

// GET /api/v1/models/:slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const item = await modelService.getModelBySlug(slug);
    if (!item) return fail(res, 'NOT_FOUND', 'model not found', 404);
    return ok(res, item);
  } catch (err) {
    console.error(err);
    return fail(res, 'INTERNAL', 'internal error', 500);
  }
});

module.exports = router;


