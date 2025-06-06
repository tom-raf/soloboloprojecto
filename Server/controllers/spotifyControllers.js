import querystring from 'querystring';
import { exchangeCodeForToken, fetchSpotifyProfile } from '../services/spotifyService.js';
import dotenv from 'dotenv'

dotenv.config() // trying to keep the important data on .env
const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const scope = 'user-read-private user-read-email user-read-playback-state playlist-modify-public playlist-modify-private';

export function redirectToSpotify (req, res) { // this is the login to redirect to spotify
  console.log(clientId) //TODO:remove this before final this is just for testing
  const params = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope, // this is where we put the scope in
    redirect_uri: redirectUri,
  });
  console.log(params)

  res.redirect(`https://accounts.spotify.com/authorize?${params}`); //we redirect to spotify using the .env 
}

export async function handleSpotifyCallback (req, res) { //this is the profile callback will have to make  a different one for playlists etc.
  const code = req.query.code;

  try {
    const tokenData = await exchangeCodeForToken(code);
    const profile = await fetchSpotifyProfile(tokenData.access_token); // TODO: split this off into a different function
    const params = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      display_name: profile.display_name || '',
      email: profile.email || ''
    });
    res.redirect(`http://localhost:5173/?${params.toString()}`); // we redirect back to frontend with the profile data
    console.log(params);
  } catch (err) {
    console.error(err);
    res.redirect('http://localhost:5173/?error=spotify_auth_failed'); // bugsplat
  }
}