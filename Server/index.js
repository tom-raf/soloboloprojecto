import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import spotifyRouter from './router/spotifyRouter.js';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();
app.use(cors());
const port = 3000;
app.use(express.json());


//connected to routers
app.use(cookieParser());
app.use('/', spotifyRouter)

//start up server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});