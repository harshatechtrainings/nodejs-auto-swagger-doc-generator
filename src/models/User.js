/** @format */

// models/User.js
const mongoose = require("mongoose");
const config = require("config");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  created: { type: Number, required: true },
  lastupdated: { type: Number, defualt: 0 },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number, default: 0 },
  activated: { type: Boolean, required: false, default: false },
  usertype: { type: String, default: "" },
});

// models/User.js
const MAX_LOGIN_ATTEMPTS = config.get("security.maxLoginAttempts");
const LOCK_TIME = config.get("security.accountLockDuration") * 60 * 1000; // 2 hours in milliseconds

userSchema.methods.incrementLoginAttempts = function () {
  this.loginAttempts += 1;
  return this.save();
};

userSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.save();
};

userSchema.methods.isMaxLoginAttemptsExceeded = function () {
  return this.loginAttempts >= MAX_LOGIN_ATTEMPTS;
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.lockAccount = function () {
  this.lockUntil = Date.now() + LOCK_TIME;
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
