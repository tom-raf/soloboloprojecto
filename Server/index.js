import express from 'express';
import router from './routes/SRroutes.js';
import cors from 'cors';
require('dotenv').config();

//standard spin up
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

//connected to router
app.use('/', router)

//start up server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});