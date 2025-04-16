const express = require("express");
const meanuDetails = require("../models/Meanu");

const router = express.Router();

router.get("/", async (req, res) => {
    const meanuList = await meanuDetails.find();
  try {
    res.status(200).json({ message: "meanu found", meanuList });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
});

module.exports = router;
