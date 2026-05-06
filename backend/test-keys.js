require('dotenv').config();
const Razorpay = require('razorpay');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKeys() {
  console.log('--- Testing API Keys ---');

  // 1. Test Razorpay
  console.log('\nTesting Razorpay...');
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const options = {
      amount: 100, // amount in the smallest currency unit (1 INR)
      currency: "INR",
      receipt: "test_receipt_001"
    };
    
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay is working! Created test order:', order.id);
  } catch (error) {
    console.error('❌ Razorpay Error:', error.message || error.description || error);
  }

  // 2. Test Gemini
  console.log('\nTesting Gemini API...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = "Reply with exactly one word: 'Success'";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(`✅ Gemini is working! Response: ${text.trim()}`);
  } catch (error) {
    console.error('❌ Gemini Error:', error.message || error);
  }
}

testKeys();
