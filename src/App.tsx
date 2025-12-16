import React, { useState } from 'react';
import CryptoTable from './CryptoTable';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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

  const handleDisclaimerClick = () => {
    setShowDisclaimer(true);
  };

  const closeDisclaimer = () => {
    setShowDisclaimer(false);
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
      
      {/* Disclaimer Link */}
      <footer className="footer">
        <button 
          className="disclaimer-link" 
          onClick={handleDisclaimerClick}
        >
          Disclaimer
        </button>
      </footer>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="disclaimer-modal-overlay" onClick={closeDisclaimer}>
          <div className="disclaimer-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Disclaimer</h3>
            <p>We do not collect personal information.</p>
            <button className="disclaimer-close" onClick={closeDisclaimer}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
