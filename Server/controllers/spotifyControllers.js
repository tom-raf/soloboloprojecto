import { fetchSpotifyProfile, fetchCurrentlyPlayingTrack } from "../services/spotifyService.js";

export async function getSpotifyProfile (req, res) {
  console.log('Session:', req.session)
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const profileData = await fetchSpotifyProfile(accessToken);
    res.json(profileData);
  } catch (err) {
    console.error("Failed to fetch profile", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export async function getCurrentlyPlaying (req, res) {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const currentlyPlayingData = await fetchCurrentlyPlayingTrack(accessToken);
    res.json(currentlyPlayingData);
  } catch (err) {
    console.error("Failed to fetch currently playing track", err);
    res.status(500).json({ error: "Failed to fetch currently playing track" });
  }
}