const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require('body-parser');

const userRoutes = require("./routes/auth");
const userDetailsRoutes = require("./routes/userDetails");
const createUserRoutes = require("./routes/createUser");
const meanuDetailsRoutes = require("./routes/meanuList");
const placeOrderRoutes = require("./routes/placeOrder");
const chatApi = require("./routes/chat");
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/userdetails", userDetailsRoutes);
app.use("/api/createUser", createUserRoutes);
app.use("/api/meanuList", meanuDetailsRoutes);
app.use("/api", placeOrderRoutes);
app.use("/api", chatApi);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
