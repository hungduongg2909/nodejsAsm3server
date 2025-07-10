const express = require("express");
const userController = require("../controllers/userController");
const checkLoginByCookie = require("../middlewares/checkLoginByCookie");

const router = express.Router();

router.get('/', userController.getAllUsers);

router.post('/signup', userController.registerUser);
router.post('/login', userController.postLogin);
router.post('/email', checkLoginByCookie, userController.postEmailAndOrder);

module.exports = router;