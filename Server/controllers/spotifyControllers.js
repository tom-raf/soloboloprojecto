import querystring from 'querystring';
import { exchangeCodeForToken, fetchSpotifyProfile } from '../services/spotifyService.js';
import dotenv from 'dotenv'

dotenv.config()
const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const scope = 'user-read-private user-read-email';

export function redirectToSpotify (req, res) {
  console.log(clientId)
  const params = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}

export async function handleSpotifyCallback (req, res) {
  const code = req.query.code;

  try {
    const tokenData = await exchangeCodeForToken(code);
    const profile = await fetchSpotifyProfile(tokenData.access_token);
    const params = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      display_name: profile.display_name || '',
      email: profile.email || ''
    });
    res.redirect(`http://localhost:5173/?${params.toString()}`);
  } catch (err) {
    console.error(err);
    res.redirect('http://localhost:5173/?error=spotify_auth_failed');
  }
}