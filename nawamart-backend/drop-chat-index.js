require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Drop the restrictive index
    await mongoose.connection.collection('chats').dropIndex('merchant_1_customer_1_store_1');
    console.log('Dropped merchant_1_customer_1_store_1 index successfully');
    
    process.exit(0);
  } catch (err) {
    if (err.code === 27) {
      console.log('Index already dropped or does not exist');
      process.exit(0);
    } else {
      console.error('Error:', err);
      process.exit(1);
    }
  }
}

fixIndices();
