import querystring from 'querystring';
import { exchangeCodeForToken } from '../services/spotifyService.js';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state"
].join(" ");

export function redirectToSpotifyLogin (req, res) {
  const params = querystring.stringify({ // you need to make it into a string
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}

export async function handleSpotifyCallback (req, res) {
  const code = req.query.code;
  console.log('This is the spotify code:', code)
  if (!code) return res.status(400).send("No code returned from Spotify");

  try {
    const tokenData = await exchangeCodeForToken(code);

    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token;
    console.log('This is the sessopn access token:', req.session.accessToken) // this is working

    //save token
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Failed to save session");
      }
      console.log('session saved:', req.session);
      res.redirect("http://localhost:5173");
    });
  } catch (err) {
    console.error("Error exchanging code for token", err);
    res.status(500).send("Failed to authenticate");
  }
}

