const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
   {
      category: {
         type: String,
         required: true,
      },
      img1: {
         type: String,
         required: true,
      },
      img2: {
         type: String,
         required: true,
      },
      img3: {
         type: String,
         required: true,
      },
      img4: {
         type: String,
         required: true,
      },
      long_desc: {
         type: String,
         required: true,
      },
      short_desc: {
         type: String,
         required: true,
      },
      name: {
         type: String,
         required: true,
      },
      price: {
         type: String,
         required: true,
      },
      countInStock: {
         type: String,
         required: true,
         min: 0,
         default: 0,
      },
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model("Product", productSchema);
