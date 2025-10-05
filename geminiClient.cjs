require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local");
const genAI = new GoogleGenerativeAI(apiKey);
module.exports.gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

