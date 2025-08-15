'use strict';
const { Router } = require('express');
const health = require('./health.routes');
const models = require('./models.routes');
const deals = require('./deals.routes');
const stores = require('./stores.routes');
const reviews = require('./reviews.routes');
const auth = require('./auth.routes');

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/models', models);
router.use('/deals', deals);
router.use('/stores', stores);
router.use('/reviews', reviews);

module.exports = router;


