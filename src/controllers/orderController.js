const Product = require("../models/Products/products");
const Order = require("../models/Products/orders");
const User = require("../models/User/user");
const stripe = require("stripe")(
  "sk_test_51MmD7AKWp5Tqj00gEscotVZAU9knx8KK2LBtjc1ExITHnDSMuRkAZMEOx1LZGlRscZVWE4fg9ePsUe7v7Hr5SCqI00A34Yifrb"
);
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "products.product",
        select: "name price",
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
    const orders = await Order.find({ user: useerId }).populate({
      path: "products.product",
      select: "name price",
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
const pay = async (req, res) => {
  try {
    const { id } = req.params;
    const charge = await stripe.charges.create({
      amount: req.body.amount,
      currency: "usd",
      source: req.body.id,
      description: id,
    });
    if (!charge)
      return res
        .status(400)
        .json({ success: false, message: "Payment failed" });
    await Order.updateOne({ _id: id }, { status: "pending" });
    res.send("Payment successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment failed");
  }
};
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
    // await Promise.all(
    //   products.map(async (item) => {
    //     await Product.updateOne(
    //       { _id: item.product },
    //       { $inc: { quantity: -item.quantity } }
    //     );
    //   })
    // )
    //   .then(() => {
    return res
      .status(200)
      .json({ success: true, order, message: "Order created" });
    // })
    // .catch((error) => {
    //   return res.status(500).json({ success: false, message: error.message });
    // });
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
    const updated = await Order.updateOne(
      { _id: id },
      {
        status: req.body.status,
        updatedAt: Date.now(),
      }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Order not updated" });
    res.status(200).json({ success: true, updated, message: "Order updated" });
  } catch (error) {
    console.log(error);
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
// pk_test_51MmD7AKWp5Tqj00g372akif5TlPohMNRZLW0KOjMgtOT0ygKngAPaRwV88dPn2T6y0eiSjv5eagNkCjvqhkKkCJG00UwbrpTSJ
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
