require('dotenv').config();
const mongoose = require('mongoose');

const wipe = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await db.dropCollection(collection.name);
    }

    console.log('Database wiped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Wipe failed:', error);
    process.exit(1);
  }
};

wipe();
