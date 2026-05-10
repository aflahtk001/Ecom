const Product = require('../models/Product');
const Shopkeeper = require('../models/Shopkeeper');

const getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({ shopkeeperId: req.params.shopId }).populate('category');
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProduct = async (req, res) => {
  try {
    // Check if the shopkeeper's store is approved
    const shopkeeper = await Shopkeeper.findById(req.user.id);
    if (!shopkeeper) return res.status(404).json({ message: 'Store not found' });
    if (!shopkeeper.isApproved) {
      return res.status(403).json({ message: 'Your store is pending admin approval. You cannot add products yet.' });
    }

    const { name, malayalamName, category, actualCost, sellingCost, stockQuantity, unit, description } = req.body;
    const image = req.file ? req.file.path : '';
    
    const product = new Product({
      shopkeeperId: req.user.id,
      name, malayalamName, category, description, image, actualCost, sellingCost, stockQuantity, unit
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Ensure the shopkeeper owns the product
    if (product.shopkeeperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.shopkeeperId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this product' });
    }

    const { name, malayalamName, category, actualCost, sellingCost, stockQuantity, unit, description } = req.body;
    
    product.name = name || product.name;
    product.malayalamName = malayalamName || product.malayalamName;
    product.category = category || product.category;
    product.actualCost = actualCost || product.actualCost;
    product.sellingCost = sellingCost || product.sellingCost;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.unit = unit || product.unit;
    product.description = description || product.description;

    if (req.file) {
      product.image = req.file.path;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getShopProducts, createProduct, deleteProduct, updateProduct };
