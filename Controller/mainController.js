import db from "../Models/index.js";
import logger from "../logger.js";

const workingrequest = async (req, res) => {
  res.set("Cache-Control", "no-cache");

  try {
    await db.sequelize.authenticate();

    if (req.method === "GET" && Object.keys(req.query).length === 0 && Object.keys(req.body).length === 0) {
      res.status(200).json();
      logger.info('Get Request Successful for Healthz');

    } else {
      res.status(400).json();
      logger.error('Healthz Request Error');
    }
  } catch (error) {
    logger.error('Healthz Request Error');
    res.status(503).json();
    logger.error('Request Error');
  }
};

const notallowedrequest = async (req, res) => {
  res.set("Cache-Control", "no-cache");
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      logger.error('Request Error');
      return res.status(400).json();
    } else {
      logger.error('Request Error');
      return res.status(405).json();
    }
  } catch (error) {
    logger.error('message');
    res.status(503).json();
    logger.fatal('message');
  }
};

export default { workingrequest, notallowedrequest };