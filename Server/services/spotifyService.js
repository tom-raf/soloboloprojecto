export async function exchangeCodeForToken (code) {
  const params = new URLSearchParams({ // im not sure what this does exactly i copied from their example, i know the .env files
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET
  });

  const response = await fetch('https://accounts.spotify.com/api/token', { //this is the call you make to the spotify api to get a token (it lasts for an hour)
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  return await response.json(); // access_token should be a long ass line of code
}

export async function fetchSpotifyProfile (accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', { // this is a call to fetch your profile 
    headers: { Authorization: `Bearer ${accessToken}` } // you need to pass the access token
  });
  return await response.json(); // turn it back into json so frontend can understand it
}


