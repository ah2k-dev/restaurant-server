const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  // quantity: {
  //   type: Number,
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product
