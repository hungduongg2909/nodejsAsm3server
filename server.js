require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const socket = require("./socket");
const cookieParser = require("cookie-parser");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoomsRoutes = require("./routes/chatRoomsRoutes");

const app = express();
const server = http.createServer(app);
const io = socket.init(server);

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusterfunix.togdz.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=ClusterFunix`;

// Middleware
app.use(
   cors()
   // cors({
      // origin: [
      // "http://localhost:3000",
      // "http://localhost:3001",
      // "http://54.254.177.24:3000",
      // "http://54.254.177.24:3001",
      // "https://famous-hotteok-6fb3ad.netlify.app",
      // "https://686f7c25e3957f0008ed14db--famous-hotteok-6fb3ad.netlify.app",
      // "https://soft-praline-a96359.netlify.app",
      // "https://687083d34771cc5a8a51a00b--soft-praline-a96359.netlify.app",
   // ],
   //    methods: ["GET", "POST", "PUT", "DELETE"],
   //    credentials: true,
   // })
);
app.use(express.json());
app.use(
   session({
      secret: process.env.JWT_SECRET || "dann",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
         mongoUrl: MONGO_URI,
         collectionName: "sessions",
      }),
      cookie: {
         maxAge: 24 * 60 * 60 * 1000, // 1 ngày
         httpOnly: true,
         secure: true,
         sameSite: "None",
      },
   })
);
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/histories", orderRoutes); // Order
app.use("/chatrooms", chatRoomsRoutes);

// DB connect + start server
const PORT = process.env.PORT || 5000;

mongoose
   .connect(MONGO_URI)
   .then(() => {
      server.listen(PORT, () =>
         console.log(`Server running at http://localhost:${PORT}`)
      );
   })
   .catch((err) => console.error("MongoDB connect error:", err));

// Socket connection
io.on("connection", (socket) => {
   console.log("Client connected:", socket.id);

   // Client gửi message
   socket.on("send_message", (data) => {
      // console.log("Message received from client:", data);

      // Gửi lại cho tất cả client khác (admin + client)
      io.emit("receive_message", data);
   });

   // Khi user gửi /end để kết thúc phiên chat
   socket.on("end_room", (data) => {
      console.log("End room signal:", data.roomId);
      // Gửi cho admin biết để cập nhật UI
      io.emit("room_ended", data.roomId);
   });

   socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
   });
});
