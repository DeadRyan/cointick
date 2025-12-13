import React from 'react';
import CryptoTable from './CryptoTable';
import logo from './images/logo.png';

function App() {
  return (
    <div className="App">
      <header className="header">
        <img src={logo} alt="CoinTick Logo" className="logo" height="50" />
        <h1>
          <span className="coin-text">Coin</span>
          <span className="tick-text">Tick</span>
        </h1>
      </header>
      <CryptoTable />
    </div>
  );
}

export default App;
