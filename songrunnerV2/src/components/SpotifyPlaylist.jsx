import { useState } from 'react';

export default function SpotifyPlaylist () {
  const [formData, setFormData] = useState({
    genre: '',
    runLength: ''
  });


  const [embedUrl, setEmbedUrl] = useState(null); // for the final playlist embed


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: formData.genre,
          runLength: Number(formData.runLength),
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON, got: ${text}`);
      }
      const data = await res.json();

      if (data.playlist_url) {
        const playlistId = data.playlist_url.split('/playlist/')[1]?.split('?')[0];
        const embed = `https://open.spotify.com/embed/playlist/${playlistId}`;
        setEmbedUrl(embed);
      }

    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };


  const genreOptions = [ // they have to be spotify friendly formatting, can add more 
    "pop",
    "rock",
    "hip-hop",
    "electronic",
    "jazz",
    "classical",
    "drum-n-bass",
    "metal"
  ];

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Genre:
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required>
            <option value="">Select a genre</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        <label>
          Run Length (minutes):
          <input
            type="number"
            name="runLength"
            required
            min='5'
            max='60'
            value={formData.runLength}
            onChange={handleChange}
            placeholder='Run length in minutes(5-60)' />
        </label>
        <button type="submit">Generate Playlist</button>
      </form>
      <p>more spacing</p>
      {embedUrl && (
        <div style={{ marginTop: '2rem' }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Playlist"
          ></iframe>
        </div>
      )}
    </div>

  );
}
