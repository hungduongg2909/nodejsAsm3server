// models/Order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
   {
      idUser: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      fullname: {
         type: String,
         required: true,
      },
      phone: {
         type: String,
         required: true,
      },
      address: {
         type: String,
         required: true,
      },
      total: {
         type: Number,
         required: true,
      },
      cart: [
         {
            idProduct: {
               type: Schema.Types.ObjectId,
               ref: "Product",
               required: true,
            },
            nameProduct: {
               type: String,
               required: true,
            },
            img: {
               type: String,
               required: true,
            },
            priceProduct: {
               type: Number,
               required: true,
            },
            count: {
               type: Number,
               required: true,
            },
         }
      ],
      delivery: {
         type: Boolean,
         default: false,
      },
      status: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model("Order", orderSchema);
