const express = require("express");
const router = express.Router();
const getAIResponse = require("../routes/utils/getAIResponse");
const { getDashboardInsights } = require("../routes/utils/dashboard");
const buildAIContextPrompt = require("../routes/utils/buildAIContextPrompt");

router.post('/chat', async (req, res) => {
  const { messages, currentTab, dashboardData } = req.body;

  if (!messages || !Array.isArray(messages) || !messages[0]?.content) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    let insights = null;

    if (currentTab === "dashboard" && dashboardData) {
      insights = getDashboardInsights(dashboardData);
    }

    const contextPrompt = buildAIContextPrompt(currentTab, dashboardData, insights);

    const fullMessages = [
      { role: "system", content: contextPrompt },
      ...messages
    ];

    const aiResponse = await getAIResponse(fullMessages);
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("AI assistant error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

module.exports = router;
