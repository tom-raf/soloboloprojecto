import { useState } from 'react';
import './App.css';
import SpotifyBar from './components/SpotifyBar';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App () {


  return (
    <Router>
      <>
        <p>hello</p>
        <SpotifyBar />
      </>
    </Router>
  )
}


export default App


