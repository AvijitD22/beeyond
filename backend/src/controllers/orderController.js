const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const placeOrder = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { items, address } = req.body; // items: [{productId, quantity}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isAvailable) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not available` });
      }
      if (item.quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price, // snapshot
      });
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      address: address || "Default Location",
    });

    // Fetch the populated order to push full details to delivery drivers
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "name price imageUrl",
      })
      .populate({
        path: "customer",
        select: "name phone",
      })
      .lean();

    //emit socket event "new-order" with fully populated order to the delivery room
    io.to("delivery").emit("new-order", populatedOrder);
    
    // Admin also receives the fully populated payload
    io.to("admin").emit("new-order", populatedOrder);

    io.emit("new-order", {
      _id: order._id,
      customer: { name: req.user.name }, // minimal
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      total: totalAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    console.log(`Fetching orders for user ${req.user?.id}`);
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 }) // newest first
      .populate({
        path: "items.product",
        select: "name price imageUrl",
      })
      .select("-__v")
      .lean(); // faster, plain JS objects

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "pending",
      deliveryPartner: null, // not yet assigned
    })
      .sort({ createdAt: 1 }) // oldest first (FIFO)
      .populate({
        path: "items.product",
        select: "name price imageUrl",
      })
      .populate({
        path: "customer",
        select: "name phone",
      })
      .select("-__v")
      .lean();

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const acceptOrder = async (req, res) => {
  const io = req.app.get("io");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: req.params.id,
      status: "pending",
      deliveryPartner: null,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Order no longer available (already accepted or not pending)",
      });
    }

    // Assign to current delivery partner
    order.deliveryPartner = req.user.id;
    order.status = "accepted";
    await order.save({ session });

    await session.commitTransaction();
    io.to(`user:${order.customer}`).emit("order-updated", {
      orderId: order._id,
      status: "accepted",
    });

    // Emit to delivery group so it removes from other drivers' available list
    io.to("delivery").emit("order-accepted", {
      orderId: order._id
    });

    // Emit to admin group to visually update the status and assigned delivery partner
    io.to("admin").emit("order-updated", {
      orderId: order._id,
      status: "accepted",
      deliveryPartner: { name: req.user.name }
    });

    res.json({
      message: "Order accepted successfully",
      order: {
        id: order._id,
        status: order.status,
        deliveryPartner: req.user.id,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ message: "Failed to accept order" });
  } finally {
    session.endSession();
  }
};

const updateOrderStatus = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only the assigned delivery partner can update
    if (order.deliveryPartner?.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this order" });
    }

    // Validate allowed transitions
    const allowedTransitions = {
      accepted: ["picked_up"],
      picked_up: ["on_the_way"],
      on_the_way: ["delivered"],
      delivered: [], // final
      cancelled: [], // we won't handle cancel for now
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from "${order.status}" to "${status}"`,
      });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    const payload = {
      orderId: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
    console.log("Emitting order update:", order._id, order.status);
    console.log("Rooms for emit:");
    console.log(`order:${order._id}`);
    console.log(`user:${order.customer}`);

    // Send to order room
    io.to(`order:${order._id}`).emit("order-updated", payload);

    // ALSO send to user room (IMPORTANT)
    io.to(`user:${order.customer}`).emit("order-updated", payload);

    // ALSO send to admin room
    io.to("admin").emit("order-updated", payload);

    res.json({
      message: `Order status updated to ${status}`,
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

const getMyActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user.id,
      status: { $in: ["accepted", "picked_up", "on_the_way"] }, // not delivered or cancelled
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "items.product",
        select: "name price imageUrl",
      })
      .populate({
        path: "customer",
        select: "name phone",
      })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "customer",
        select: "name email phone",
      })
      .populate({
        path: "deliveryPartner",
        select: "name email phone",
      })
      .populate({
        path: "items.product",
        select: "name price imageUrl",
      })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getMyActiveOrders,
  getAllOrders,
};
