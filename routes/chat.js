const express = require("express");
const router = express.Router();
const getAIResponse = require("../routes/utils/getAIResponse");

router.post("/chat", async (req, res) => {
    const { messages } = req.body;

if (!messages || !Array.isArray(messages) || !messages[0]?.content) {
  return res.status(400).json({ error: "Invalid messages format" });
}

try {
  const aiResponse = await getAIResponse(messages);
  res.json({ response: aiResponse });
} catch (error) {
  console.error("Chat error:", error);
  res.status(500).json({ error: "Failed to generate response" });
}

});

module.exports = router;
