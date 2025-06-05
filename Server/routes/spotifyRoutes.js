import express from 'express';
import { handleSpotifyCallback, redirectToSpotify } from '../controllers/spotifyControllers.js'

const spotifyRouter = express.Router();


spotifyRouter.get('/auth/login', redirectToSpotify)
spotifyRouter.get('/auth/callback', handleSpotifyCallback);


export default spotifyRouter