const Product = require("../models/Products/products");
const Order = require("../models/Products/orders");
const User = require("../models/User/user");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: "user",
      select: "name",
    });
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    if (orders.length === 0)
      return res
        .status(200)
        .json({ success: false, message: "No orders found" });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "products.product",
        populate: {
          path: "createdBy",
          select: "name",
        },
      });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "No order found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const useerId = req.user._id;
    const orders = await Order.find({ user: useerId });
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    if (orders.length === 0)
      return res
        .status(200)
        .json({ success: false, message: "No orders found" });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const pay = async (req, res) => {};
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, totalPrice } = req.body;
    const order = await Order.create({
      products,
      shippingAddress,
      totalPrice,
      user: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not created" });
    await Promise.all(
      products.map(async (item) => {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { quantity: -item.quantity } }
        );
      })
    )
      .then(() => {
        return res
          .status(200)
          .json({ success: true, order, message: "Order created" });
      })
      .catch((error) => {
        return res.status(500).json({ success: false, message: error.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (order.status == "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Order already delivered" });
    }
    if (order.status == "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order already cancelled" });
    }
    if (order.status == "paymentPending") {
      return res
        .status(400)
        .json({ success: false, message: "Order payment is pending" });
    }
    const updated = await Order.findByIdAndUpdate(id, {
      status: req.body.status,
      updatedAt: Date.now(),
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Order not updated" });
    res.status(200).json({ success: true, updated, message: "Order updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (order.status == "delivered" || order.status == "dispatched") {
      return res.status(400).json({
        success: false,
        message: "Order already delivered or dispatched",
      });
    }
    if (order.status == "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order already cancelled" });
    }
    const updated = await Order.updateOne(
      { _id: id },
      {
        status: "cancelled",
        updatedAt: Date.now(),
      }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Order not updated" });
    res.status(200).json({ success: true, updated, message: "Order updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  cancelOrder,
  pay,
};
