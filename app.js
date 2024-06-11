import express from "express";
import { config as configDotenv } from "dotenv";
import router from "./Routes/user-routes.js";
import healthrouter from "./Routes/health-routes.js";
import { handleRouteErrors } from "./Middlewares/route-errors.js"; 
import logger from "./logger.js";
configDotenv();
const app = express();
app.use(express.json());


app.use('/v2/user', router); 
app.use('/healthz', healthrouter); 

app.use(handleRouteErrors); 

app.get('/', (req, res)=>{
  res.send({
    message:'working'
  })
})
logger.info('Server listening at PORT')
const server = app.listen(process.env.APP_PORT, () => {

});

export const closeServer = () => {
  server.close();
};

export default app;