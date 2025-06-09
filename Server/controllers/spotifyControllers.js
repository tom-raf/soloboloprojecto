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

  // get the recommendations
  try {

    // const savedRes = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50`, {
    //   headers: { Authorization: `Bearer ${accessToken}` },
    // });
    // const savedData = await savedRes.json();
    // console.log('these are the 50 tracks spotify is returning', savedData);
    // const savedTracks = savedData.items.map(item => item.track);


    // // 2. Get unique artist IDs
    // const artistIds = [...new Set(savedTracks.map(track => track.artists[0]?.id).filter(Boolean))];

    // // 3. Fetch genres for these artists (max 50 per request)
    // const artistGenres = {};
    // for (let i = 0; i < artistIds.length; i += 50) {
    //   const chunk = artistIds.slice(i, i + 50);
    //   const artistRes = await fetch(`https://api.spotify.com/v1/artists?ids=${chunk.join(',')}`, {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   });
    //   const artistData = await artistRes.json();
    //   for (const artist of artistData.artists) {
    //     artistGenres[artist.id] = artist.genres; // { "artistId": ["pop", "rock"] }
    //   }
    // }

    // // filter for genre
    // const genreLower = genre.toLowerCase();
    // const matchingTracks = savedTracks.filter(track => {
    //   const artistId = track.artists[0]?.id;
    //   const genres = artistGenres[artistId] || [];
    //   return genres.some(g => g.toLowerCase().includes(genreLower));
    // });

    // // filter by run length
    // const runLengthMS = Number(runLength) * 60 * 1000; // spotify only deals in MS
    // let totalDuration = 0;
    // const finalTracks = [];

    // for (const track of matchingTracks) {
    //   if (totalDuration + track.duration_ms <= runLengthMS) {
    //     finalTracks.push(track.uri);
    //     totalDuration += track.duration_ms;
    //   } else {
    //     break;
    //   }
    // }

    // if (finalTracks.length === 0) {
    //   return res.status(400).json({ error: 'No matching tracks found for genre and duration.' });
    // }

    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profileData = await profileRes.json();

    if (!profileData.id) {
      return res.status(400).json({ error: 'Could not get user profile' });
    }

    const userId = profileData.id;

    // make the playlist
    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
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

    const playlistData = await playlistRes.json(); // return data
    console.log('playlistData:', playlistData);
    const playlistId = playlistData.id // this is the id for the playlist we just made

    // add the recommemdations to the playlist

    // await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     uris: finalTracks, //pass all the uris
    //   }),
    // });

    // final response, return the url so we can embed it on page
    res.json({
      message: 'playlist created',
      playlist_url: playlistData.external_urls,
      // track_count: finalTracks.length
    })


  } catch (error) {
    console.error('error cfreating playlist:', error);
    res.status(500).json({ error: 'failed to create playlist' });
  }
};

// console.log()
// const recUrl = new URL('https://api.spotify.com/v1/recommendations'); TODO: this is deprecated
// recUrl.searchParams.append('seed_genres', genre);
// recUrl.searchParams.append('target_tempo', Number(bpm));
// recUrl.searchParams.append('limit', 100); // how many songs get returned

// const recRes = await fetch(recUrl, {
//   headers: { Authorization: `Bearer ${accessToken}` }, // pass token in header
// });
// console.log('this is the recRes:', recRes)
// const recData = await recRes.json(); // receive the recommendations list
// const runLengthMS = runLength * 60 * 1000 //spotify only works in MS
// let totalDuration = 0;
// const finalTracks = []; //these are the tracks we'll put to the playlist

// for (const track of recData.tracks) {
//   if (totalDuration + track.duration_ms <= runLengthMS) {
//     finalTracks.push(track.uri);
//     totalDuration += track.duration_ms; // push and iterate
//   }
//   else {
//     break;
//   }
// }