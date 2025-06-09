import React, { useEffect, useState } from "react";
import { data, useLocation } from "react-router-dom";
import SpotifyPlaylist from './SpotifyPlaylist.jsx';

export default function SpotifyBar () {
  const [profile, setProfile] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // const params = new URLSearchParams(location.search); // grab token from redirect url from backend
    // const token = params.get("access_token");

    // if (token) {
    //   localStorage.setItem("spotify_access_token", token); // save to local storage
    //   window.history.replaceState({}, document.title, "/"); // clean url
    // }

    // const storedToken = localStorage.getItem("spotify_access_token");
    // if (!storedToken) return;

    // fetch spotify profile
    fetch('http://localhost:3000/profile')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Token invalid or expired', data.error);
          localStorage.removeItem('spotify_access_token');
          setProfile(null);
        } else {
          setProfile(data);
        }
      })
      .catch(err => console.error('Error fetching profile', err));
  }, [location.search]);

  const fetchCurrentlyPlaying = () => {
    fetch('http://localhost:3000/currently-playing')
      .then(res => {
        console.log(res);
        if (res.status === 204 || res.status === 202) {
          setCurrentlyPlaying(null);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch currently playing track");
        }
        return res.json();
      })
      .then(data => {
        if (data && data.item) {
          setCurrentlyPlaying(data);
        }
      })
      .catch(err => console.error("Failed to fetch currently playing", err));
  };




  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/login"; // starts Spotify login
  }

  if (!profile) {
    return <button onClick={handleLogin}>Login with Spotify</button>;
  }

  return (
    <div className="spotify-bar">
      <h2>Welcome, {profile.display_name}</h2>
      {profile.images?.length > 0 && (
        <img src={profile.images[0].url} alt="Profile" width="100" />
      )}
      <p> spacing </p>
      <iframe
        src="https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp"
        width="300"
        height="80"
        allow="encrypted-media"
        allowFullScreen={false}
        title="Spotify Player"
      />
      <SpotifyPlaylist></SpotifyPlaylist>
      <p>spacing</p>
      <button onClick={fetchCurrentlyPlaying} style={{ marginTop: "1rem" }}>
        Refresh Currently Playing
      </button>
      {currentlyPlaying && currentlyPlaying.item ? (
        <div style={{ marginTop: "1rem" }}>
          <h3>Currently Playing</h3>
          <p>
            <strong>{currentlyPlaying.item.name}</strong> by{" "}
            {currentlyPlaying.item.artists.map(artist => artist.name).join(", ")}
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