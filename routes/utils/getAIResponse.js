const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAIResponse(messages) {
  try {
    const completion = await openai.chat.completions.create({
    //   model: "gpt-4-mini",
      model: "gpt-4o-mini", 
      messages,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return `Error: ${error.message || "Unknown error"}`;
  }
}

module.exports = getAIResponse;
