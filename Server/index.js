import express from 'express';
// import router from './routes/SRroutes.js';
import cors from 'cors';
import spotifyRouter from './routes/spotifyRoutes.js';
import dotenv from 'dotenv'
import session from 'express-session';
dotenv.config();
const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
  }
}));

//standard spin up
const port = 3000;
app.use(express.json());

//connected to routers
app.use('/api', spotifyRouter)

//start up server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});