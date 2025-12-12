import React, { useEffect, useState } from 'react';

interface Cryptocurrency {
  id: string;
  market_cap_rank: number;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

// API Configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';

// Formatting Constants
const SMALL_PRICE_DECIMALS = 6; // For cryptocurrency prices under $1
const TRILLION_THRESHOLD = 1e12;
const BILLION_THRESHOLD = 1e9;
const MILLION_THRESHOLD = 1e6;

const Homepage: React.FC = () => {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        const response = await fetch(COINGECKO_API_URL);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }
        
        const data = await response.json();
        setCryptos(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // Use more decimal places for small-value cryptocurrencies
    return `$${price.toFixed(SMALL_PRICE_DECIMALS)}`;
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= TRILLION_THRESHOLD) {
      return `$${(num / TRILLION_THRESHOLD).toFixed(2)}T`;
    }
    if (num >= BILLION_THRESHOLD) {
      return `$${(num / BILLION_THRESHOLD).toFixed(2)}B`;
    }
    if (num >= MILLION_THRESHOLD) {
      return `$${(num / MILLION_THRESHOLD).toFixed(2)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading cryptocurrency data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Cryptocurrency Prices by Market Cap</h1>
        <p>Top 100 cryptocurrencies by market capitalization</p>
      </div>
      
      <table className="crypto-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>24h %</th>
            <th>Market Cap</th>
            <th>Volume (24h)</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td>{crypto.market_cap_rank}</td>
              <td>
                <div className="coin-name-cell">
                  <img 
                    src={crypto.image} 
                    alt={crypto.name}
                    className="coin-logo"
                  />
                  <div className="coin-info">
                    <span className="coin-name">{crypto.name}</span>
                    <span className="coin-symbol">{crypto.symbol}</span>
                  </div>
                </div>
              </td>
              <td>{formatPrice(crypto.current_price)}</td>
              <td className={crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
                {formatPercentage(crypto.price_change_percentage_24h)}
              </td>
              <td>{formatLargeNumber(crypto.market_cap)}</td>
              <td>{formatLargeNumber(crypto.total_volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Homepage;
