const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { deliveryOnly } = require("../middleware/roleMiddleware");
const {
  placeOrder,
  getMyOrders,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getMyActiveOrders,
} = require("../controllers/orderController");
const { adminOnly } = require("../middleware/authMiddleware");
const { getAllOrders } = require("../controllers/orderController");

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/available", protect, deliveryOnly, getAvailableOrders);
router.patch("/:id/accept", protect, deliveryOnly, acceptOrder);
router.patch("/:id/status", protect, deliveryOnly, updateOrderStatus);
router.get("/my-active", protect, deliveryOnly, getMyActiveOrders);

// Add admin-only route
router.get('/all', protect, adminOnly, getAllOrders);

// Later: GET /my-orders etc.

module.exports = router;
