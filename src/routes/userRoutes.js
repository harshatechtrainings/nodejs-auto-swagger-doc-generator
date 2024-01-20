/** @format */

// routes/authRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const userMiddleware = require("../middlewares/userMiddleware");


const router = express.Router();

router.delete("/:user", userMiddleware.authorizeUserToDelete, userController.deleteUser);

router.get("/:username", userMiddleware.authorizeUserToDelete, userController.findUserByUsername);

router.get("/", userMiddleware.authorizeUserToDelete, userController.fetchUsers);

router.put("/:username", userMiddleware.authorizeUserToDelete, userController.updateUser);

router.get("/verify", authController.verify);

module.exports = router;
