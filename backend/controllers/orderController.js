const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create new order and initiate Razorpay payment
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, deliveryAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Initialize Razorpay instance (using dummy keys if env vars missing)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Group products by shopkeeperId
    const shopkeeperGroups = {};
    products.forEach(item => {
      const shopId = item.shopkeeperId;
      if (!shopId) return;
      if (!shopkeeperGroups[shopId]) {
        shopkeeperGroups[shopId] = {
          shopkeeperId: shopId,
          products: [],
          totalAmount: 0
        };
      }
      shopkeeperGroups[shopId].products.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
      shopkeeperGroups[shopId].totalAmount += (item.price * item.quantity);
    });

    // Save orders in our database as 'pending'
    const createdOrders = [];
    for (const shopId in shopkeeperGroups) {
      const group = shopkeeperGroups[shopId];
      const order = new Order({
        userId: req.user.id,
        shopkeeperId: shopId,
        products: group.products,
        totalAmount: group.totalAmount,
        deliveryAddress,
        razorpayOrderId: rzpOrder.id,
        paymentStatus: 'pending',
        orderStatus: 'placed'
      });
      const savedOrder = await order.save();
      createdOrders.push(savedOrder);
      
      // Emit real-time notification to the shopkeeper
      const io = req.app.get('io');
      if (io) {
        io.to(shopId.toString()).emit('newOrder', savedOrder);
      }
    }

    res.status(201).json({
      orders: createdOrders,
      razorpayOrder: rzpOrder
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Transaction not legit!' });
    }

    // Find the orders and update status
    const orders = await Order.find({ razorpayOrderId: razorpay_order_id });
    if (!orders || orders.length === 0) return res.status(404).json({ message: 'Orders not found' });

    await Order.updateMany(
      { razorpayOrderId: razorpay_order_id },
      { $set: { paymentStatus: 'completed', orderStatus: 'confirmed' } }
    );

    res.json({ message: 'Payment verified successfully', orderIds: orders.map(o => o._id) });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a shopkeeper
// @route   GET /api/orders/shopkeeper
const getShopkeeperOrders = async (req, res) => {
  try {
    const orders = await Order.find({ shopkeeperId: req.user.id })
      .populate('userId', 'name phone')
      .populate('products.productId', 'name unit')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (shopkeeper workflow)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.shopkeeperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    // Emit real-time notification to the user
    const io = req.app.get('io');
    if (io) {
      io.to(order.userId.toString()).emit('orderStatusUpdated', order);
    }

    res.json({ message: `Order status updated to ${orderStatus}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a user
// @route   GET /api/orders/my
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('shopkeeperId', 'storeName')
      .populate('products.productId', 'name unit')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getShopkeeperOrders, updateOrderStatus, getUserOrders };
