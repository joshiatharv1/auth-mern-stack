import db from "../Models/index.js";
import bcrypt from "bcrypt";
import Sequelize, { DataTypes } from "sequelize";
import logger from "../logger.js";
const { User } = db;
import { config as configDotenv } from "dotenv";
configDotenv();
import { PubSub } from '@google-cloud/pubsub';

const projectId = 'csye6225-414414';

// Initialize Pub/Sub client with your project ID
const pubSubClient = new PubSub({ projectId });
const topicNameOrId = 'projects/csye6225-414414/topics/verify_email';
const register = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      logger.error('Request body must not be empty');
      return res.status(400).json({ message: "Request body must not be empty" });
    }

    // console.log("Received request body:", req.body);

    const existingUser = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (existingUser) {
      // console.log("User already exists:", existingUser.toJSON());
      logger.error('User Already Exists');      
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = req.body;
    
    const unexpectedFields = Object.keys(user).filter(field => !['first_name', 'last_name', 'username', 'password'].includes(field));
    if (unexpectedFields.length > 0) {
      // console.log("Unexpected fields found:", unexpectedFields);
      logger.error('Unexpected fields in request body');      
      return res.status(400).json({ message: "Unexpected fields in request body" });
    }

    if (!user.first_name || !user.last_name || !user.username || !user.password) {
      logger.error('Missing fields in request body');
      // console.log("Missing mandatory fields:", user);
      return res
        .status(400)
        .json({
          message:
            "Username, Firstname, Lastname, and Password are mandatory fields",
        });
    }

    const isEmailFormat = String(user.username)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    if (!isEmailFormat) {
      // console.log("Invalid email format:", user.username);
      logger.warn('Invalid Email Format');
      return res
        .status(400)
        .json({ message: "Username should be an Email ID" });
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    // Delete unexpected fields to prevent them from being included in the user object
    delete user.id;
    delete user.account_created;
    delete user.account_updated;

    user.account_created = new Date();
    user.account_updated = new Date();

    const createdUser = await User.create(user);

    // // console.log("User created:", createdUser.toJSON());
    logger.info('User Created');
    const responseObj = {
      id: createdUser.id,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name,
      username: createdUser.username,
      account_created: createdUser.account_created,
      account_updated: createdUser.account_updated,
    };
    if (process.env.test === 'Testenv') {
      console.log("Skipping Here")
    } else {
      const userPayload = {
        username: createdUser.username,
        id: createdUser.id
      };
      user.emailSentAt = new Date();
  
      const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publishJSON(userPayload);
      console.log(`Message ${messageId} published.`);
    }
    return res.status(201).json(responseObj);      // Continue with other logic or return a response accordingly
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
    console.error("Error during registration:", error);
    logger.error('Error during registration');
    return res.status(400).json(error);
  }
}
const getUserDetails = async (req, res) => {
  try {
    const user = req.user; // Assuming req.user is properly populated with user details

    if (!user) {
      logger.error('User Not Found');
      return res.status(401).json({ message: 'User not found' });
    }
    const existingUser = await User.findOne({
      attributes: ['id', 'first_name', 'last_name', 'username', 'account_created', 'account_updated'],
      where: {
        username: user.username,
      },
    });

    if (!existingUser) {
      logger.error('User Not Found');
      return res.status(401).json({ message: 'User not found' });
    }

    const userDetails = {
      id: existingUser.id,
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      username: existingUser.username,
      account_created: existingUser.account_created,
      account_updated: existingUser.account_updated,
    };

    logger.info('User Details Retrieved');
    res.status(200).json(userDetails);
  } catch (error) {
    logger.error('Internal Server Error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const user = req.user; // Assuming req.user is properly populated with user details

    if (!user) {
      logger.error('User Not Found');
      return res.status(401).json({ message: 'User not found' });
    }
    if (Object.keys(req.body).length === 0) {
      logger.error('Request Body Empty');
      return res.status(400).json({ message: 'Request body must not be empty' });
    }
    const { first_name, last_name, password } = req.body;
    const allowedFields = ['first_name', 'last_name', 'password'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      logger.warn('Only select fields can be updated');
      return res.status(400).json({ message: 'Only first name, last name, and password can be updated' });
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;

    if (password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, salt);
    }

    user.account_updated = new Date();
    await user.save();

    logger.info('User Details Updated');
    return res.status(204).json({ message: 'User details updated successfully' });
  } catch (error) {
    logger.error('Error while updating');
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username (email) must be unique' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verifyUserEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      logger.error('User ID missing in the body of url');
      return res.status(400).json({ message: "User ID missing in body of url" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn('No Such User Found in databse');
      return res.status(404).json({ message: "No Such User Found in Database" });
    }
    if (!user.emailSentAt) {
      logger.warn('No Email Sent for user');
      return res.status(400).send('No Email Sent for user');
    }
    const emailSentTimestamp = new Date(user.emailSentAt).getTime();
    const currentTimestamp = new Date().getTime();
    const timeElapsed = currentTimestamp - emailSentTimestamp;
    const expirationTimeInMilliseconds = 2 * 60 * 1000;
    if (timeElapsed <= expirationTimeInMilliseconds) {
      user.isEmailAddressVerified = true;
      user.verificationCompletedAt = currentTimestamp;
      await user.save();
      logger.info('Email For the user is verified');
      return res.send('Email For User Verified');
    } else {
      logger.warn('More than 2 min since email link sent');
      return res.status(400).send('More than 2 min since email link sent');
    }
  } catch (error) {
    logger.error('Error during email verification', { error: error.message, stack: error.stack });
    return res.status(500).send('Error during email verification');
  }
};



export default { register, getUserDetails, updateUserDetails, verifyUserEmail};
