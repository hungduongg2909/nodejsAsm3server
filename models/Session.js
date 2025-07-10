const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: false,
      },
      messages: [
         {
            sender: { type: String, enum: ["user", "admin", "consultant"], required: true },
            message: { type: String, required: true },
            sentAt: { type: Date, default: Date.now },
         },
      ],
   },
   { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
