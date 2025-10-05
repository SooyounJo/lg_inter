const { gemini } = require("../geminiClient.cjs");

async function run() {
  try {
    const result = await gemini.generateContent("Hello from Gemini!");
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
  }
}

run();


