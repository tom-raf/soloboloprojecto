import querystring from 'querystring';
import { exchangeCodeForToken } from '../services/spotifyService.js';
import dotenv from 'dotenv'
dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state"
].join(" ");

export function redirectToSpotifyLogin (req, res) {
  const params = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}

export async function handleSpotifyCallback (req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code returned from Spotify");

  try {
    const tokenData = await exchangeCodeForToken(code);

    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token;
    console.log(req.session.accessToken)

    // Make sure to save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Failed to save session");
      }
      res.redirect("http://localhost:5173");
    });
  } catch (err) {
    console.error("Error exchanging code for token", err);
    res.status(500).send("Failed to authenticate");
  }
}







// export function redirectToSpotify (req, res) { // this is the login to redirect to spotify
//   console.log(clientId) //TODO:remove this before final this is just for testing
//   const params = querystring.stringify({
//     response_type: 'code',
//     client_id: clientId,
//     scope, // this is where we put the scope in
//     redirect_uri: redirectUri,
//   });
//   console.log(params)

//   res.redirect(`https://accounts.spotify.com/authorize?${params}`); //we redirect to spotify using the .env 
// }

// export async function handleSpotifyCallback (req, res) { //this is the profile callback will have to make  a different one for playlists etc.
//   const code = req.query.code;

//   try {
//     const tokenData = await exchangeCodeForToken(code);
//     const profile = await fetchSpotifyProfile(tokenData.access_token); // TODO: split this off into a different function
//     const params = new URLSearchParams({
//       access_token: tokenData.access_token,
//       refresh_token: tokenData.refresh_token,
//       display_name: profile.display_name || '',
//       email: profile.email || ''
//     });
//     res.redirect(`http://localhost:5173/?${params.toString()}`); // we redirect back to frontend with the profile data
//     console.log(params);
//   } catch (err) {
//     console.error(err);
//     res.redirect('http://localhost:5173/?error=spotify_auth_failed'); // bugsplat
//   }
// }