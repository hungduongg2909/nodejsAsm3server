const Session = require("../models/Session");

// Tạo room mới (Session)
exports.createNewRoom = async (req, res) => {
   try {
      const { userId } = req.body;
      const newRoom = await Session.create({ user: userId, messages: [] });
      // console.log("Created session:", newRoom);
      res.status(200).json(newRoom);
   } catch (err) {
      console.error("Error in createNewRoom:", err);
      res.status(500).json({ message: "Server error", error: err.message });
   }
};

// Lấy tin nhắn theo roomId
exports.getMessageByRoomId = async (req, res) => {
   try {
      const roomId = req.query.roomId;
      const session = await Session.findById(roomId);
      res.status(200).json({ content: session.messages });
   } catch (err) {
      res.status(500).json({ message: "Server error" });
   }
};

// Thêm message
exports.addMessage = async (req, res) => {
   try {
      const { message, roomId, is_admin } = req.body;

      const session = await Session.findById(roomId);
      // console.log("Session found:", session);
      if (!session) {
         return res.status(404).json({ message: "Room not found" });
      }

      session.messages.push({
         sender: is_admin ? "consultant" : "user",
         message,
      });

      await session.save();

      res.status(200).json({ message: "Message added" });
   } catch (err) {
      console.error("Error in addMessage:", err);
      res.status(500).json({ message: "Server error", error: err.message });
   }
};

// Lấy toàn bộ room (cho admin)
exports.getAllRoom = async (req, res) => {
   try {
      const sessions = await Session.find().sort({ createdAt: -1 });
      res.status(200).json(sessions);
   } catch (err) {
      res.status(500).json({ message: "Server error" });
   }
};
