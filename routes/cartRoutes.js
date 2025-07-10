const express = require('express');
const cartController = require('../controllers/cartController');
const checkLoginByCookie = require("../middlewares/checkLoginByCookie");

const router = express.Router();

router.get('/', checkLoginByCookie, cartController.getCart);
router.post('/add', checkLoginByCookie, cartController.addToCart);

module.exports = router;