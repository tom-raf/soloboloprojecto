import dotenv from 'dotenv';
import crypto from 'crypto';
import fetch from 'node-fetch';
dotenv.config();


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state"
].join(" ");

// local variables for the codes because spotify is weird
let codeVerifierStore = '';
let accessTokenStore = '';

// spotify PKCE utility functions
const base64URLEncode = (buffer) => {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateRandomString = (length) => {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, length);
};

const generateCodeChallenge = (codeVerifier) => {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return base64URLEncode(hash);
};

// login function
export const spotifyLogin = (req, res) => {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // local store for the token
  codeVerifierStore = codeVerifier;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
};

// exchange the verifier code from spotify for the token
export const getToken = async (req, res) => {
  const { code } = req.query;

  if (!code || !codeVerifierStore) {
    return res.status(400).json({ error: 'Missing authorization code or code_verifier' });
  }

  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifierStore,
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description || 'Token exchange failed' });
    }

    accessTokenStore = data.access_token;
    console.log('This is your access token:', accessTokenStore)

    // redirect to frontend with token
    res.redirect(`http://localhost:5173/?access_token=${accessTokenStore}`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error during token exchange' });
  }
};

export const getSpotifyProfile = async (req, res) => {
  // const accessToken = req.headers.authorization?.split(' ')[1];
  const accessToken = accessTokenStore

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    console.log('This is the profile date:', data);

    res.json(data);
  } catch (err) {
    console.error('Spotify API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createPlaylist = async (req, res) => {
  console.log('placeholder for create playlist')
  playlistToken = accessTokenStore

}

export const getCurrentlyPlaying = async (req, res) => {
  const accessToken = accessTokenStore
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    console.log('This is what is currently palying:', data);

    res.json(data);
  } catch (err) {
    console.error('Spotify API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

}
