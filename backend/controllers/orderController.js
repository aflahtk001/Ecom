const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create new order and initiate Razorpay payment
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, deliveryAddress, paymentMethod = 'Razorpay' } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let rzpOrder = null;
    if (paymentMethod === 'Razorpay') {
      // Initialize Razorpay instance
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
      });

      // Create Razorpay order
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };

      rzpOrder = await razorpay.orders.create(options);
    }

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
        razorpayOrderId: rzpOrder ? rzpOrder.id : null,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending', // Both start as pending
        orderStatus: 'received'
      });
      const savedOrder = await order.save();

      // If COD, decrement stock immediately
      if (paymentMethod === 'COD') {
        for (const item of group.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: -item.quantity }
          });
        }
      }
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

    // Decrement stock for each product in the verified orders
    for (const order of orders) {
      if (order.paymentStatus !== 'completed') { // Prevent double decrement if already verified
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: -item.quantity }
          });
        }
      }
    }

    await Order.updateMany(
      { razorpayOrderId: razorpay_order_id },
      { $set: { paymentStatus: 'completed', orderStatus: 'received' } }
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
    const validStatuses = ['received', 'packed', 'picked', 'delivered', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Role-based restrictions
    if (req.user.role === 'shopkeeper') {
      if (order.shopkeeperId.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to update this order' });
      }
      if (orderStatus !== 'packed' && orderStatus !== 'cancelled') {
        return res.status(400).json({ message: 'Shopkeepers can only mark as packed or cancelled' });
      }
    } else if (req.user.role === 'admin') {
      if (!['picked', 'delivered', 'cancelled'].includes(orderStatus)) {
        return res.status(400).json({ message: 'Admin can only mark as picked, delivered, or cancelled' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    await order.save();

    // If order is cancelled and was previously not cancelled, restore stock
    if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity }
        });
      }
    }

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

// @desc    Get all orders for admin
// @route   GET /api/orders/admin
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name phone')
      .populate('shopkeeperId', 'storeName ownerName')
      .populate('products.productId', 'name unit')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getShopkeeperOrders, updateOrderStatus, getUserOrders, getAdminOrders };
