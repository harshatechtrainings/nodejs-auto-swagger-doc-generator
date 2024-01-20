/** @format */

// app.js
const express = require("express");
const db = require("./src/config/db");
const configureMiddleware = require("./src/config/middleware");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const app = express();

configureMiddleware(app);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await db.connectToDatabase();
});

module.exports = app;
