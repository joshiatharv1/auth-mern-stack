import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASS,
  DB: process.env.MYSQL_DB,
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 3000,
    idle: 10000,
  },
};

export default dbConfig;



