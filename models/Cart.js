const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
   {
      idUser: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      idProduct: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
         required: true,
      },
      count: {
         type: Number,
         required: true,
         min: 1,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
