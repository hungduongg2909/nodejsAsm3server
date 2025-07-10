const express = require("express");
const router = express.Router();
const chatRoomsController = require("../controllers/chatRoomsController");

// Tạo room mới
router.post("/createNewRoom", chatRoomsController.createNewRoom);

// Lấy message theo roomId (dùng query param ?roomId=abc)
router.get("/getById", chatRoomsController.getMessageByRoomId);

// Thêm message (dùng PUT thay vì POST nếu FE đang dùng PUT)
router.put("/addMessage", chatRoomsController.addMessage);

// Lấy tất cả room
router.get("/getAllRoom", chatRoomsController.getAllRoom);

module.exports = router;
