const express = require('express');
const router = express.Router();
const { createOrder, webhook, getOrder } = require('../controllers/sepayController');

router.post('/create-order', createOrder);
router.post('/webhook', webhook);
router.get('/webhook', (req, res) => res.sendStatus(200));
router.get('/order/:code', getOrder);


module.exports = router;
