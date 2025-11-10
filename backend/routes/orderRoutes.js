const express = require("express");
const router = express.Router();
const {
  placeOrder,
  approveOrder,
  rejectOrder,
  getAllOrders,
  getOrdersByShopId,
} = require("../controllers/orderController");

// 🛒 Place new order
router.post("/add", placeOrder);

// ✅ Approve order
router.put("/approve/:billId", approveOrder);

// 🚫 Reject order
router.put("/reject/:billId", rejectOrder);

// 📜 Get all orders
router.get("/allorders", getAllOrders);

// 🏪 Get all orders by shop ID
router.get("/shop/:shopid", getOrdersByShopId);

module.exports = router;
