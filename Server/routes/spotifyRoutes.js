import express from 'express';
import { getSpotifyProfile, getCurrentlyPlaying } from '../controllers/spotifyControllers.js';
import { redirectToSpotifyLogin, handleSpotifyCallback } from '../controllers/spotifyAuthController.js';
const spotifyRouter = express.Router();

spotifyRouter.get('/auth/login', redirectToSpotifyLogin);
spotifyRouter.get('/auth/callback', handleSpotifyCallback);

spotifyRouter.get('/profile', getSpotifyProfile);
spotifyRouter.get('/currently-playing', getCurrentlyPlaying);

export default spotifyRouter;