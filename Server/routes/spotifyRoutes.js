import express from 'express';
import { handleSpotifyCallback, redirectToSpotify } from '../controllers/spotifyControllers.js'

const spotifyRouter = express.Router();


spotifyRouter.get('/auth/login', redirectToSpotify) // this is the initial login to get to spotify and allow permissions / generate token
spotifyRouter.get('/auth/callback', handleSpotifyCallback); // this is the callback that handles spotify redirecting back to the page


export default spotifyRouter