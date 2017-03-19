import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Board from './Board'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <h2>Lonely Knight</h2>
        <Board knightPosition={[0, 0]}/>
      </div>
    );
  }
}

export default App;
