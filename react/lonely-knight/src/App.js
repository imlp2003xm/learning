import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Board from './Board'
import { observe } from './Game'

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
        <BoardContainer/>
      </div>
    );
  }
}

class BoardContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      knightPosition: null
    }
  }

  render() {
    const board = this.state.knightPosition ? <Board knightPosition={this.state.knightPosition}/> : null;

    return (
      <div className="board-container">
        {board}
      </div>
    );
  }

  componentWillMount() {
    observe(knightPosition => {
      this.setState({knightPosition});
    });
  }
}

export default App;
