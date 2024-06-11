import logger from "../logger.js";

const handleRouteErrors = (req, res, next) => {
  if (req.originalUrl.startsWith('/healthz')) {
    if (req.method === 'HEAD') {
      logger.warn('Method Not Allowed - HEAD request to /healthz');
      res.status(405).json();
    }
  } else {
    logger.error('Route Not Found');
    res.status(404).json();
  }
};


const checkDatabaseHealth = async (req, res, next) => {
  try {
    await db.sequelize.authenticate();
    next();
  } catch (error) {
    logger.debug('Database Connection Error')
    // console.error("Database connection error:", error);
    return res.status(503).json();
  }
};
export  {handleRouteErrors, checkDatabaseHealth};
