const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const User = require("../models/User");
const Session = require("../models/Session");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getAllUsers = async (req, res) => {
   try {
      const users = await User.find();
      res.status(200).json(users);
   } catch (error) {
      console.log("Error BE getAllUsers", error);
      res.status(500).json({ message: "Error BE getAllUsers" });
   }
};

exports.registerUser = async (req, res) => {
   try {
      const { fullname, email, password, phone } = req.query;

      if (!fullname || !email || !password || !phone) {
         return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(409).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
         fullname,
         email,
         password: hashedPassword,
         phone,
      });

      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
   } catch (err) {
      console.error("Error BE registerUser", err);
      res.status(500).json({ message: "Error BE registerUser" });
   }
};

exports.postLogin = async (req, res) => {
   try {
      const { email, password } = req.body;

      // Kiểm tra email và password người dùng nhập vào có được gửi tới server không ?
      if (!email || !password) {
         return res.status(400).json({ message: "Missing email or password" });
      }

      // Tìm người dùng theo email
      const user = await User.findOne({ email });

      if (!user) {
         return res.status(401).json({ message: "Invalid email" });
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         return res.status(401).json({ message: "Invalid password" });
      }

      // Tạo session lưu vào DB
      let session = await Session.findOne({ user: user._id });
      if (!session) {
         session = new Session({ user: user._id, messages: [] });
         await session.save();
      }

      // Lưu sessionId vào cookie
      req.session.userId = user._id;

      // Thêm cookie
      res.cookie("userId", user._id, {
         httpOnly: false,
         sameSite: "Lax",
         secure: true,
         maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
         message: "Login successful",
         userId: user._id,
         fullname: user.fullname,
      });
   } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Error BE login" });
   }
};

exports.postEmailAndOrder = async (req, res) => {
   try {
      const { to, fullname, phone, address, idUser } = req.query;

      if (!to || !fullname || !phone || !address || !idUser) {
         return res.status(400).json({ message: "Missing required fields" });
      }

      const cartItems = await Cart.find({ idUser }).populate("idProduct");

      if (!cartItems.length) {
         return res.status(404).json({ message: "Cart is empty" });
      }

      let total = 0;
      const tableRows = cartItems
         .map((item) => {
            const { name, img1: img, price } = item.idProduct;
            const count = item.count;
            const subTotal = parseInt(price) * count;
            total += subTotal;

            return `
            <tr style="text-align:center;">
               <td style="padding: 8px; border: 1px solid #ccc;">${name}</td>
               <td style="padding: 8px; border: 1px solid #ccc;">
                  <img src="${img}" alt="${name}" width="70"/>
               </td>
               <td style="padding: 8px; border: 1px solid #ccc;">${price.toLocaleString()} VND</td>
               <td style="padding: 8px; border: 1px solid #ccc;">${count}</td>
               <td style="padding: 8px; border: 1px solid #ccc;">${subTotal.toLocaleString()} VND</td>
            </tr>
         `;
         })
         .join("");

      // Tạo Order
      const cart = cartItems.map((item) => ({
         idProduct: item.idProduct._id,
         nameProduct: item.idProduct.name,
         img: item.idProduct.img1,
         priceProduct: item.idProduct.price,
         count: item.count,
      }));

      const newOrder = new Order({
         idUser,
         fullname,
         phone,
         address,
         total,
         cart,
         delivery: false,
         status: false,
      });

      const savedOrder = await newOrder.save();

      if (!savedOrder) {
         return res.status(500).json({ message: "Failed to create order" });
      }

      // Trừ số lượng sản phẩm trong kho
      for (const item of cartItems) {
         const product = await Product.findById(item.idProduct._id);
         
         // Nếu không tìm thấy sản phẩm trong DB (product === null) thì bỏ qua
         if (!product) continue;

         if (product.countInStock < item.count) {
            return res.status(400).json({
               message: `Not enough stock for ${product.name}`,
            });
         }

         product.countInStock -= item.count;
         await product.save();
      }

      // Xoá giỏ hàng sau khi tạo đơn
      await Cart.deleteMany({ idUser });

      // Tạo và gửi email
      const now = new Date();
      const formattedDate = now.toLocaleString("vi-VN", {
         timeZone: "Asia/Ho_Chi_Minh",
         hour12: false,
         weekday: "long",
         year: "numeric",
         month: "2-digit",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
      });

      const htmlTable = `
         <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
            <thead>
               <tr style="background-color: #f2f2f2; text-align: center;">
                  <th style="padding: 10px; border: 1px solid #ccc;">Tên sản phẩm</th>
                  <th style="padding: 10px; border: 1px solid #ccc;">Hình ảnh</th>
                  <th style="padding: 10px; border: 1px solid #ccc;">Giá</th>
                  <th style="padding: 10px; border: 1px solid #ccc;">Số lượng</th>
                  <th style="padding: 10px; border: 1px solid #ccc;">Thành tiền</th>
               </tr>
            </thead>
            <tbody>
               ${tableRows}
               <tr style="background-color: #eee; font-weight: bold; text-align:center;">
                  <td colspan="4" style="padding: 10px; border: 1px solid #ccc;">Tổng tiền</td>
                  <td style="padding: 10px; border: 1px solid #ccc;">${total.toLocaleString()} VND</td>
               </tr>
            </tbody>
         </table>
      `;

      const msg = {
         to: to,
         from: process.env.FROM_EMAIL,
         subject: "Order Confirmation - Thank You for Your Purchase!",
         html: `
            <h2>Xin chào ${fullname},</h2>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Address:</strong> ${address}</p>
            ${htmlTable}
            <p><strong>Thời gian đặt hàng:</strong> ${formattedDate}</p>
            <p style="margin-top: 20px;">Cảm ơn bạn!</p>
         `,
      };

      await sgMail.send(msg);

      return res
         .status(200)
         .json({ message: "Order created and email sent successfully" });
   } catch (error) {
      console.error("Error BE postEmailAndOrder", error);
      return res.status(500).json({ message: "Error BE postEmailAndOrder" });
   }
};
