// controllers/orderController.js
const Order = require("../models/Order");

exports.getAllOrders = async (req, res) => {
   try {
      const orders = await Order.find().sort({ createdAt: -1 });

      if (!orders || orders.length === 0) {
         return res.status(404).json({ message: "No orders found" });
      }

      return res.status(200).json(orders);
   } catch (error) {
      console.error("Error BE getAllOrders:", error);
      return res.status(500).json({ message: "Error BE getAllOrders" });
   }
};

exports.getUserOrders = async (req, res) => {
   try {
      const { idUser } = req.query;

      if (!idUser) {
         return res.status(400).json({ message: "Missing idUser" });
      }

      const orders = await Order.find({ idUser }).sort({ createdAt: -1 });

      return res.status(200).json(orders);
   } catch (error) {
      console.error("Error BE getUserOrders:", error);
      return res.status(500).json({ message: "Error BE getUserOrders" });
   }
};

exports.getDetailOrder = async (req, res) => {
   try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(order);
   } catch (error) {
      console.error("Error BE getDetailOrder", error);
      res.status(500).json({ message: "Error BE getDetailOrder" });
   }
};
