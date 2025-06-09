import { useState } from "react"

export default function SpotifyPlaylist () {
  const [genre, setGenre] = useState("");
  const [runLength, setRunLength] = useState(""); // in minutes
  const [bpm, setBpm] = useState("");

  // const [message, setMessage] = useState("");

  return (
    <div>
      <form>
        <h3>Create Playlist by Genre, Run Length & BPM</h3>

        <label>
          Genre:
          <input
            type="text"
            value={genre}
            // onChange={(e) => setGenre(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Run Length (minutes):
          <input
            type="number"
            value={runLength}
            // onChange={(e) => setRunLength(e.target.value)}
            required
            min="1"
          />
        </label>
        <br />
        <label>
          BPM:
          <input
            type="number"
            value={bpm}
            // onChange={(e) => setBpm(e.target.value)}
            required
            min="30"
            max="250"
          />
        </label>
        <br />
        <button type="submit">Create Playlist</button>
        <p>placeholder</p>
      </form>
    </div >
  )
}