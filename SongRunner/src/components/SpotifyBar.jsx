import React, { useEffect, useState } from "react";


export default function SpotifyBar () {
  const [profile, setProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("access_token");

    if (token) {
      setAccessToken(token);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Failed to fetch profile", err));
  }, [accessToken]);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/login";
  };

  if (!profile) {
    return <button onClick={handleLogin}>Login with Spotify</button>;
  }

  return (
    <div>
      <h2>Welcome, {profile.display_name}</h2>
      {profile.images?.[0]?.url && (
        <img src={profile.images[0].url} alt="Profile" width={100} />
      )}
      <p></p>
      {/* <iframe className="spotify-widget"
        style={{ borderRadius: "12px", marginTop: "1rem" }}
        src="https://open.spotify.com/embed/track/1lDWb6b6ieDQ2xT7ewTC3G?utm_source=generator"
        width="300"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      /> */}
      <iframe src="https://open.spotify.com/embed/playlist/5bPnKYPCfR2k1wNYMUOk33?utm_source=generator"
        width="100%" height="352"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
  );
}
