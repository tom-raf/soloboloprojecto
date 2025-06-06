import React, { useEffect, useState } from "react";

export default function SpotifyBar () {
  const [profile, setProfile] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/login";
  };

  const fetchCurrentlyPlaying = () => {
    fetch("http://localhost:3000/api/currently-playing", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 204 || res.status === 202) {
          setCurrentlyPlaying(null);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch currently playing track");
        return res.json();
      })
      .then((data) => {
        if (data && data.item) setCurrentlyPlaying(data);
      })
      .catch((err) => console.error(err));
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

      <iframe
        src="https://open.spotify.com/embed/playlist/5bPnKYPCfR2k1wNYMUOk33?utm_source=generator"
        width="100%"
        height="352"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>

      <button onClick={fetchCurrentlyPlaying} style={{ marginTop: "1rem" }}>
        Refresh Currently Playing
      </button>

      {currentlyPlaying && currentlyPlaying.item ? (
        <div style={{ marginTop: "1rem" }}>
          <h3>Currently Playing</h3>
          <p>
            <strong>{currentlyPlaying.item.name}</strong> by{" "}
            {currentlyPlaying.item.artists.map((a) => a.name).join(", ")}
          </p>
          <img
            src={currentlyPlaying.item.album.images[0].url}
            alt="Album Art"
            width={100}
          />
        </div>
      ) : (
        <p style={{ marginTop: "1rem" }}>Nothing currently playing</p>
      )}
    </div>
  );
}