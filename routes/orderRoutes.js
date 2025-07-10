const express = require("express");
const orderController = require("../controllers/orderController");
const checkLoginByCookie = require("../middlewares/checkLoginByCookie");

const router = express.Router();

router.get("/", checkLoginByCookie, orderController.getUserOrders);
router.get("/all", orderController.getAllOrders);
router.get("/:id", checkLoginByCookie, orderController.getDetailOrder);

module.exports = router;