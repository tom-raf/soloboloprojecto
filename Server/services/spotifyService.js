
export async function exchangeCodeForToken (code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) throw new Error("Token exchange failed");

  return response.json();
}

export async function fetchSpotifyProfile (accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify profile');
  }

  return response.json();
}

export async function fetchCurrentlyPlayingTrack (accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) {
    // no content, nothing playing
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch currently playing track');
  }

  return response.json();
}