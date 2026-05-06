require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const password = 'admin@123';
    const name = 'Platform Admin';

    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log('Admin already exists. Updating password...');
    } else {
      admin = new Admin({ name, email });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();
    console.log('Admin account created/updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Creation failed:', error);
    process.exit(1);
  }
};

createAdmin();
