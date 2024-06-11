import db from "../Models/index.js";
import bcrypt from 'bcrypt';
import logger from "../logger.js";
const { User } = db;
import { config as configDotenv } from "dotenv";
configDotenv();
const basicAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            logger.error('Authorization header missing')
            // console.log('Authorization header missing');
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const authDecoded = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
        const [username, ...passwordArray] = authDecoded.split(':');
        const password = passwordArray.join(':');
        const existingUser = await User.findOne({
            attributes: ['id', 'username', 'password', 'isEmailAddressVerified'],
            where: {
                username: username,
            },
        });

        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            logger.error('Invalid credentials')
            // console.log('Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (process.env.test === 'Testenv') {
            console.log("Skipping Here")
          } else {
            if (!existingUser.isEmailAddressVerified) {
                logger.error('User not verified yet');
                return res.status(403).json({ message: 'You are not verified yet' });
            }
            };

        // Update req.user with the fetched user details
        req.user = existingUser;


        logger.debug('User authenticated successfully')
        // console.log('User authenticated successfully:', existingUser);
        req.user = existingUser;
        next();
    } catch (error) {
        logger.error('Error in basicAuthMiddleware')
        // console.error('Error in basicAuthMiddleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default basicAuthMiddleware;