import React, { useEffect, useState } from "react";

export default function SpotifyBar () {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const isCallback = url.pathname === "/callback";
    const code = url.searchParams.get("code");

    if (isCallback && code) {
      fetch(`http://localhost:3001/api/auth/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data.profile);
          window.history.replaceState({}, document.title, "/");
        });
    }
  }, []);

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
      <p>Email: {profile.email}</p>
    </div>
  );
}
