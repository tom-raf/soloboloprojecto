import { useState } from 'react';
import './App.css';
import SpotifyBar from './components/SpotifyBar';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import songrunnertitle from '../src/assets/songrunnertitle.jpg'

function App () {


  return (
    <Router>
      <div className='full-app'>
        <img className="title-image" src={songrunnertitle} alt="Title" />
        <SpotifyBar />
      </div>
      <div className='scrolling-background'></div>
    </Router >
  )
}


export default App


