import express from 'express';
import mainController from '../Controller/mainController.js';

const healthrouter = express.Router();

// According to the assignment, you should only have workingrequest
healthrouter.get('/', mainController.workingrequest);

// The assignment said to throw an error in POST, PUT, PATCH, DELETE
healthrouter.all('/', mainController.notallowedrequest);


export default healthrouter;