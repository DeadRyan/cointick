import React, { useState } from 'react';
import CryptoTable from './CryptoTable';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    setShowSearch(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="App">
      <header className="header">
        <h1 className="header-title" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <span className="coin-text">Coin</span>
          <span className="tick-text">Tick</span>
        </h1>
        <button 
          className="hamburger-menu" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        {isMenuOpen && (
          <nav className="menu-dropdown">
            <button 
              className="menu-item" 
              onClick={handleSearchClick}
            >
              Search
            </button>
          </nav>
        )}
      </header>
      <CryptoTable showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </div>
  );
}

export default App;
