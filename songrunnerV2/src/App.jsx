import { useState } from 'react';
import './App.css';
import SpotifyBar from './components/SpotifyBar';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App () {


  return (
    <Router>
      <div className='full-app'>
        <h1 className='title'>SongRunner</h1>
        <SpotifyBar />
      </div>
      <div className='scrolling-background'></div>
    </Router >
  )
}


export default App


