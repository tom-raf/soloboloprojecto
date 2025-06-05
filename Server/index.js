import express from 'express';
import router from './routes/SRroutes.js';
import cors from 'cors';
import spotifyRouter from './routes/spotifyRoutes.js';
import dotenv from 'dotenv'




//standard spin up
dotenv.config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

//connected to routers
app.use('/', router)
app.use('/api', spotifyRouter)

//start up server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});