import React, { useEffect, useState } from "react";
import { data, useLocation } from "react-router-dom";
import SpotifyPlaylist from './SpotifyPlaylist.jsx';

export default function SpotifyBar () {
  const [profile, setProfile] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {

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
      <div className="profile-bar">
        {profile.images?.length > 0 && (
          <img src={profile.images[0].url} alt="Profile" width="100" />
        )}
        <h2>{profile.display_name}</h2>
        <button onClick={() => setShowModal(true)} className="how-to-button">HOW-TO</button>
      </div>

      <SpotifyPlaylist />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>How to Use SongRunner</h3>
            <p>select a genre</p>
            <p>choose your run length (max 60 minutes)</p>
            <p>click gen</p>
            <p>run</p>
            <p>It's going to save the playlist under your Spotify account. It'll be called Songrunner:"Genre"</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}