const Product = require("../models/Products/products");
const Order = require("../models/Products/orders");
const User = require("../models/User/user");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name");
    if (!products)
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    if (products.length === 0)
      return res
        .status(200)
        .json({ success: false, message: "No products found" });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("createdBy", "name");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "No product found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category } = req.body;
    const product = await Product.create({
      name,
      price,
      description,
      image,
      category,
      // quantity,
      createdBy: req.user._id,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not created" });
    res.status(200).json({ success: true, product, message: "Product created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        image,
        category,
        // quantity,
      },
      { new: true }
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not updated" });
    res.status(200).json({ success: true, product, message: "Product updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not deleted" });
    res.status(200).json({ success: true, product, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
