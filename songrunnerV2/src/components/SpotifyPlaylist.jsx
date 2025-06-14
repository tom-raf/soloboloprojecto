import { useState } from 'react';
import '../App.css';

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
    <div className='playlist-bar'>
      <form className='playlist-form' onSubmit={handleSubmit}>
        <label>
          GENRE:
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required>
            <option value="">select genre</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        <label>
          RUN LENGTH:
          <input
            type="number"
            name="runLength"
            required
            min='5'
            max='60'
            value={formData.runLength}
            onChange={handleChange}
            placeholder='run length (minutes)' />
        </label>
        <button type="submit">GEN PLAYLIST</button>
      </form>
      {embedUrl && (
        <div style={{ marginTop: '2rem' }} className='embed-container'>
          <iframe
            src={embedUrl + '?theme=0'}
            width="100%"
            height="380"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Playlist"
          ></iframe>
        </div>
      )}
    </div>

  );
}

