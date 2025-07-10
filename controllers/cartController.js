const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
   try {
      const { idUser } = req.query;

      if (!idUser) {
         return res.status(400).json({ message: "User ID is required" });
      }

      // Populate idProduct để lấy thông tin sản phẩm
      const cartItems = await Cart.find({ idUser }).populate("idProduct");

      if (cartItems.length === 0) {
         return res.status(404).json({ message: "Cart is empty" });
      }

      // Format lại dữ liệu trả về cho FE
      const formattedCart = cartItems.map((item) => ({
         idUser: item.idUser,
         idProduct: item.idProduct._id,
         nameProduct: item.idProduct.name,
         img: item.idProduct.img1,
         count: item.count,
         priceProduct: item.idProduct.price,
      }));

      res.status(200).json(formattedCart);
   } catch (error) {
      console.error("Error BE getCart", error);
      res.status(500).json({ message: "Error BE getCart" });
   }
};

exports.addToCart = async (req, res) => {
   try {
      const { idUser, idProduct, count } = req.query;

      // Kiểm tra sản phẩm có tồn tại không
      const product = await Product.findById(idProduct);
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }

      // Kiểm tra nếu sản phẩm đã có trong cart thì cập nhật số lượng
      const existingCart = await Cart.findOne({ idUser, idProduct });
      if (existingCart) {
         existingCart.count += parseInt(count);
         await existingCart.save();
         return res.status(200).json({ message: "Cart updated successfully" });
      }

      // Nếu chưa có thì thêm mới
      const newCart = new Cart({
         idUser,
         idProduct,
         count: parseInt(count),
      });

      await newCart.save();
      res.status(201).json({ message: "Product added to cart" });
   } catch (error) {
      console.error("Error BE addToCart", error);
      res.status(500).json({ message: "Error BE addToCart" });
   }
};
