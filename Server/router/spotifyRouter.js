import express from 'express';
import { spotifyLogin, getToken, getSpotifyProfile, createPlaylist, getCurrentlyPlaying } from '../controllers/spotifyControllers.js'
const spotifyRouter = express.Router();

spotifyRouter.get('/api/auth/login', spotifyLogin);
spotifyRouter.get('/api/auth/callback', getToken);
spotifyRouter.get('/profile', getSpotifyProfile); //https://api.spotify.com/v1/me
spotifyRouter.get('/currently-playing', getCurrentlyPlaying); //"https://api.spotify.com/v1/me/player/currently-playing"
spotifyRouter.get('/playlist', createPlaylist);

export default spotifyRouter;

