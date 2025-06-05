import querystring from 'querystring';
import { exchangeCodeForToken, fetchSpotifyProfile } from '../services/spotifyService.js';
import dotenv from 'dotenv'

dotenv.config();
const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const scope = 'user-read-private user-read-email';

export function redirectToSpotify (req, res) {
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
    res.json({ profile, tokens: tokenData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
}