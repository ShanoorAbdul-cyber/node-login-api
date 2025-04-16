const express = require("express");
const UserDetails = require("../models/UserDetails");

const router = express.Router();

// ✅ GET: Fetch all user details
router.get("/", async (req, res) => {
  try {
    const users = await UserDetails.find();
    if (users.length === 0) {
      return res.status(200).json({ message: "No user details found", data: [] });
    }
    res.status(200).json({ message: "User details found", data: users });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
});

// ✅ PUT: Update user details by ID
router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedUser = await UserDetails.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", /*data: updatedUser* if we need we use this what return updated data*/ });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Error updating user details", error });
  }
});

module.exports = router;
