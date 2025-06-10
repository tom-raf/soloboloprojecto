import dotenv from 'dotenv';
import crypto from 'crypto';
import fetch from 'node-fetch';
dotenv.config();


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

// local variables for the codes because spotify is weird
let codeVerifierStore = '';
let accessTokenStore = '';
let userIdStore = '';

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

    res.redirect(`http://localhost:5173`);
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
    const userIdStore = data.id;
    console.log('This is your user id:', userIdStore)

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



export const createPlaylist = async (req, res) => {
  console.log('this is the data we are making a playlist with:', req.body);
  const { genre, runLength } = req.body;
  const accessToken = accessTokenStore;
  // const userId = userIdStore;
  console.log('this is your access token:', accessToken)

  try {

    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profileData = await profileRes.json();

    if (!profileData.id) {
      return res.status(400).json({ error: 'Could not get user profile' });
    }

    const userId = profileData.id;
    const genrePlaylistMap = {
      "pop": "7xNYFGqY4s8pwfkG0vTASD",
      "rock": "23hD5D7bvXtkJGz2ni7s9e",
      "hip-hop": "2ZmBEJRMH8rgtVB1GonReM",
      "electronic": "2ZxWjBMlRYQfENCeMl1Sab",
      "jazz": "3BVbH9zuT0T0EXodND8LfS",
      "classical": "34lPKDQ8gTZW4wXDR8G6kM",
      "dnb": "6a83Dkuyr2OJtlCmAQKG82",
      "metal": "0cMpgbvQxoOYrT7IoCx2Gn"
    };

    const genre = req.body.genre;
    const playlist_id = genrePlaylistMap[genre];

    const getPlaylistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const playlistData = await getPlaylistRes.json();
    if (!playlistData.tracks?.items) {
      return res.status(400).json({ error: 'Could not get tracks from source playlist' });
    }

    // pull and filter the tracks 
    const sourceTracks = playlistData.tracks.items
      .map(item => item.track)
      .filter(Boolean);

    const runLengthMs = runLength * 60 * 1000;
    let totalDuration = 0;
    const selectedTrackUris = [];

    for (const track of sourceTracks) {
      if (track.duration_ms + totalDuration <= runLengthMs) {
        selectedTrackUris.push(track.uri);
        totalDuration += track.duration_ms;
      } else {
        break;
      }
    }

    console.log('these are the filtered tracks:', selectedTrackUris)

    // make the playlist
    const newPlaylistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `SongRunner : ${genre}`,
        description: "Generated by Songrunner",
        public: true,
      }),
    });

    const newPlaylistData = await newPlaylistRes.json(); // return data
    console.log('newplaylistData:', newPlaylistData);
    const newPlaylistId = newPlaylistData.id // this is the id for the playlist we just made



    // add the right songs to the playlist
    await fetch(`https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: selectedTrackUris
      })
    });

    // final response, return the url so we can embed it on page
    res.json({
      message: 'playlist created',
      playlist_url: newPlaylistData.external_urls,
    })


  } catch (error) {
    console.error('error cfreating playlist:', error);
    res.status(500).json({ error: 'failed to create playlist' });
  }
};
