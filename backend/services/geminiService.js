const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBQXrw3kRrXjtFEOr0OCv-o6-wDro6f4Zg';
const genAI = new GoogleGenerativeAI(API_KEY);

const generateSeasonalSuggestions = async (storeCategory = 'general') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    const prompt = `
      You are an AI assistant for GramaBazaar, a rural e-commerce platform in Kerala, India.
      A shopkeeper runs a store in the '${storeCategory}' category. 
      The current month is ${currentMonth}.
      Based on the typical seasonal trends, upcoming festivals (like Onam, Vishu, Ramadan, Christmas), or weather in Kerala during this month, suggest 3 highly specific products they should stock up on to maximize sales.
      Return ONLY a valid JSON array of objects, where each object has a "product" string and a "reason" string. Do not include markdown formatting or explanations.
      Example: [{"product": "Banana Chips", "reason": "High demand for snacks during the festival season."}, {"product": "Rose Water", "reason": "Popular for traditional recipes in summer."}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up potential markdown block if Gemini adds it
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback suggestions
    return [
      { product: "Premium Rice", reason: "Staple diet with consistent high demand." },
      { product: "Coconut Oil", reason: "Essential for traditional Kerala cooking." },
      { product: "Fresh Spices", reason: "Seasonal harvest yields better quality and sales." }
    ]; 
  }
};

module.exports = { generateSeasonalSuggestions };
