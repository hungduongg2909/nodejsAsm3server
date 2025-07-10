const User = require("../models/User");

const checkLoginByCookie = async (req, res, next) => {
   const { userId } = req.cookies;
   if (!userId) return res.status(401).json({ message: "Not authenticated" });

   try {
      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = user; // Gắn vào req để dùng tiếp
      next();
   } catch (err) {
      return res.status(500).json({ message: "Error BE middleware checkLoginByCookie" });
   }
};

module.exports = checkLoginByCookie;
