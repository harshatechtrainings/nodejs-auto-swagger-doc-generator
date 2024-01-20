/** @format */

const mongoose = require("mongoose");
require("dotenv").config();

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // You might want to handle the error in a way that makes sense for your application
    // For example, throw an error or exit the process
    throw error;
  }
}

module.exports = { connectToDatabase };
