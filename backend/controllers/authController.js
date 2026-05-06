const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shopkeeper = require('../models/Shopkeeper');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// --- USER AUTH ---
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, phone, password: hashedPassword });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- SHOPKEEPER AUTH ---
const registerShopkeeper = async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, password, category, coordinates } = req.body;
    const shopExists = await Shopkeeper.findOne({ email });
    if (shopExists) return res.status(400).json({ message: 'Shopkeeper already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const shopkeeper = await Shopkeeper.create({
      storeName, ownerName, email, phone, password: hashedPassword, category,
      location: coordinates ? { type: 'Point', coordinates } : undefined
    });
    
    if (shopkeeper) {
      res.status(201).json({ _id: shopkeeper._id, storeName: shopkeeper.storeName, email: shopkeeper.email, role: shopkeeper.role, token: generateToken(shopkeeper._id, shopkeeper.role) });
    } else {
      res.status(400).json({ message: 'Invalid shopkeeper data' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginShopkeeper = async (req, res) => {
  try {
    const { email, password } = req.body;
    const shopkeeper = await Shopkeeper.findOne({ email }).populate('category', 'name');
    if (shopkeeper && (await bcrypt.compare(password, shopkeeper.password))) {
      res.json({
        _id: shopkeeper._id,
        storeName: shopkeeper.storeName,
        ownerName: shopkeeper.ownerName,
        email: shopkeeper.email,
        phone: shopkeeper.phone,
        role: shopkeeper.role,
        isApproved: shopkeeper.isApproved,
        category: shopkeeper.category,
        token: generateToken(shopkeeper._id, shopkeeper.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- ADMIN AUTH ---
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, token: generateToken(admin._id, admin.role) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Note: Admin registration is usually done manually or via a separate secure script.

module.exports = { registerUser, loginUser, registerShopkeeper, loginShopkeeper, loginAdmin };
