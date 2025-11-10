const Order = require("../models/Order");
const Product = require("../models/productModel");

// 🛒 Customer places an order (reduce stock immediately)
exports.placeOrder = async (req, res) => {
  try {
    const { name, shopname, shopid, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in the order" });
    }

    // Unique billId → timestamp + product count
    const billId = `${Date.now()}_${products.length}`;
    let totalAmount = 0;
    // 🧮 Check stock and reduce quantity
    for (const item of products) {
      const product = await Product.findOne({ product_id: item.product_id });

      if (!product) {
        return res.status(404).json({ message: `Product ID ${item.product_id} not found` });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `❌ Insufficient stock for ${product.product_name}`,
        });
      }
      totalAmount += parseFloat(product.price) * item.quantity;
      // Reduce stock immediately
      product.stock_quantity -= item.quantity;
      await product.save();
    }

    // Save order
    const newOrder = new Order({
      billId,
      name,
      shopname,
      shopid,
      products,
      total_amount: totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "✅ Order placed successfully (Stock reduced)",
      billId,
      total_amount: totalAmount,
      newOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error placing order",
      error: error.message,
    });
  }
};

// ✅ Admin approves order (keeps stock reduced)
exports.approveOrder = async (req, res) => {
  try {
    const { billId } = req.params;
    const order = await Order.findOne({ billId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isApproved) {
      return res.status(400).json({ message: "Order already approved" });
    }

    order.isApproved = true;
    await order.save();

    res.json({ message: "✅ Order approved successfully", order });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error approving order",
      error: error.message,
    });
  }
};

// 🚫 Admin rejects order (restore stock)
exports.rejectOrder = async (req, res) => {
  try {
    const { billId } = req.params;
    const order = await Order.findOne({ billId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isApproved) {
      return res.status(400).json({ message: "Cannot reject an approved order" });
    }

    // Restore stock quantities
    for (const item of order.products) {
      const product = await Product.findOne({ product_id: item.product_id });
      if (product) {
        product.stock_quantity += item.quantity;
        await product.save();
      }
    }

    await order.deleteOne();

    res.json({ message: "🚫 Order rejected and stock restored successfully" });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error rejecting order",
      error: error.message,
    });
  }
};

// 📜 Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching orders", error });
  }
};


// Get all orders by Shop ID
exports.getOrdersByShopId = async (req, res) => {
  try {
    const { shopid } = req.params;

    if (!shopid) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    const orders = await Order.find({ shopid }).sort({ orderedAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this shop" });
    }

    res.status(200).json({
      message: "✅ Orders fetched successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders by shop ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

