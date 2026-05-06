require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('./models/Category');
const Shopkeeper = require('./models/Shopkeeper');
const Product = require('./models/Product');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create Categories
    const categoryNames = ['Grocery', 'Bakery', 'Stationery'];
    const categories = [];
    for (const name of categoryNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name });
      }
      categories.push(cat);
    }
    console.log('Categories ready');

    const groceryCat = categories.find(c => c.name === 'Grocery');
    const bakeryCat = categories.find(c => c.name === 'Bakery');
    const stationeryCat = categories.find(c => c.name === 'Stationery');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Create 3 Stores
    const storesData = [
      {
        storeName: 'Fresh Mart',
        ownerName: 'Owner 1',
        email: 'store1@gmail.com',
        phone: '9876543211',
        password: hashedPassword,
        category: groceryCat._id,
        isApproved: true,
        location: { type: 'Point', coordinates: [76.3072, 10.0246] }
      },
      {
        storeName: 'Sweet Delights',
        ownerName: 'Owner 2',
        email: 'store2@gmail.com',
        phone: '9876543212',
        password: hashedPassword,
        category: bakeryCat._id,
        isApproved: true,
        location: { type: 'Point', coordinates: [76.3080, 10.0250] }
      },
      {
        storeName: 'Classic Stationers',
        ownerName: 'Owner 3',
        email: 'store3@gmail.com',
        phone: '9876543213',
        password: hashedPassword,
        category: stationeryCat._id,
        isApproved: true,
        location: { type: 'Point', coordinates: [76.3090, 10.0260] }
      }
    ];

    const shops = [];
    for (const data of storesData) {
      let shop = await Shopkeeper.findOne({ email: data.email });
      if (shop) await Shopkeeper.deleteOne({ email: data.email });
      shop = await Shopkeeper.create(data);
      shops.push(shop);
    }
    console.log('Stores created');

    // 3. Add Products to each store
    const productsData = [
      // Store 1 (Grocery)
      { shopkeeperId: shops[0]._id, name: 'Ponni Rice', malayalamName: 'പൊന്നി അരി', category: groceryCat._id, actualCost: 40, sellingCost: 38, stockQuantity: 100, unit: 'kg' },
      { shopkeeperId: shops[0]._id, name: 'Sugar', malayalamName: 'പഞ്ചസാര', category: groceryCat._id, actualCost: 45, sellingCost: 42, stockQuantity: 50, unit: 'kg' },
      { shopkeeperId: shops[0]._id, name: 'Tea Powder', malayalamName: 'ചായപ്പൊടി', category: groceryCat._id, actualCost: 120, sellingCost: 110, stockQuantity: 30, unit: 'packet' },
      
      // Store 2 (Bakery)
      { shopkeeperId: shops[1]._id, name: 'Milk Bread', malayalamName: 'പാൽ ബ്രെഡ്', category: bakeryCat._id, actualCost: 35, sellingCost: 32, stockQuantity: 20, unit: 'packet' },
      { shopkeeperId: shops[1]._id, name: 'Chocolate Cake', malayalamName: 'ചോക്ലേറ്റ് കേക്ക്', category: bakeryCat._id, actualCost: 400, sellingCost: 380, stockQuantity: 5, unit: 'pieces' },
      { shopkeeperId: shops[1]._id, name: 'Butter Cookies', malayalamName: 'ബട്ടർ കുക്കീസ്', category: bakeryCat._id, actualCost: 80, sellingCost: 75, stockQuantity: 15, unit: 'packet' },

      // Store 3 (Stationery)
      { shopkeeperId: shops[2]._id, name: 'Blue Pen', malayalamName: 'നീല പേന', category: stationeryCat._id, actualCost: 10, sellingCost: 8, stockQuantity: 200, unit: 'pieces' },
      { shopkeeperId: shops[2]._id, name: 'Spiral Notebook', malayalamName: 'നോട്ടുപുസ്തകം', category: stationeryCat._id, actualCost: 60, sellingCost: 55, stockQuantity: 40, unit: 'pieces' },
      { shopkeeperId: shops[2]._id, name: 'Pencil Box', malayalamName: 'പെൻസിൽ ബോക്സ്', category: stationeryCat._id, actualCost: 50, sellingCost: 45, stockQuantity: 25, unit: 'pieces' }
    ];

    await Product.deleteMany({ shopkeeperId: { $in: shops.map(s => s._id) } });
    await Product.insertMany(productsData);
    console.log('Products added to each store');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
