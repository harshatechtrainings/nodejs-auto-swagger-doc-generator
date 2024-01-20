/** @format */

const authMiddleware = require("../middlewares/authMiddleware");
const { StatusMessage } = require("../utils/statusMessage");

const authorizeUserToDelete = async (req, res, next) => {
  try {
    await authMiddleware.verifyToken(req, res, next);
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { authorizeUserToDelete };
