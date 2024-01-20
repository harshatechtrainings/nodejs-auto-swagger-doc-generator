/** @format */

const User = require("../models/User");
const { StatusMessage } = require("../utils/statusMessage");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");



exports.deleteUser = async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to delete User' */
  /* #swagger.security = [{
            "bearerAuth": []
    }] */
 
  const { user } = req.params;
  const { username, password } = req.body;
  try {
    const response = await this.simpleUserauthentication(username, password);
    if (response) {
      await User.deleteOne({ username: user });
      res.status(200).json({ message: StatusMessage.SUCCESS });
    }
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

exports.fetchUsers = async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to fetch all Users' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  try {
    /** implement authenticate before fetching the users */
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

exports.findUserByUsername = async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to fetch Users by username' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: StatusMessage.USER_NOT_FOUND });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

exports.updateUser = async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to update User by username' */

  /* #swagger.security = [{
            "bearerAuth": []
    }] */
  const { username } = req.params;

  try {
    req.body.lastupdated = new Date();
    // Get the schema paths from the Mongoose model
    const modelPaths = Object.keys(User.schema.paths);

    // Check if all keys in the request body are present in the model schema
    const isValidFields = Object.keys(req.body).every((key) => modelPaths.includes(key));

    if (isValidFields) {
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
        {
          $set: req.body,
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: StatusMessage.USER_NOT_FOUND });
      }

      return res
        .status(StatusCodes.OK)
        .json({ status: ReasonPhrases.OK, message: StatusMessage.SUCCESS, data: { updatedUser } });
    } else {
      return res.status(404).json({ error: "Invalid body" });
    }
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};
