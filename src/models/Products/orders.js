const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  products: {
    type: [Schema.Types.ObjectId],
    ref: "products",
  },
  totalPrice: {
    type: Number,
  },
  status: {
    type: String,
    default: "paymentPending",
    enum: ["paymentPending", "pending", "dispatched", "delivered"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;