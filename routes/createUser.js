const express = require("express");
const CreateUser = require("../models/CreateUser");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, mobile, role } = req.body;

  if (!name || !email || !mobile || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await CreateUser.findOne({
      $or: [
        { email },
        { mobile }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new CreateUser({ name, email, role, mobile });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: "Error while user creation", error });
  }
});

module.exports = router;
