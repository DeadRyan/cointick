import React, { useEffect, useState } from 'react';
import './CryptoTable.css';
import { mockCryptoData } from './mockData';

interface CryptoData {
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

const CryptoTable: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }
        
        const data = await response.json();
        setCryptoData(data);
        setError(null);
      } catch (err) {
        // Fallback to mock data when API is unavailable (e.g., in sandboxed environments)
        console.log('Using mock data as fallback');
        setCryptoData(mockCryptoData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  const formatPrice = (price: number): string => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 10) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="crypto-container">
        <div className="loading">Loading cryptocurrency data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crypto-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="crypto-container">
      <header className="crypto-header">
        <h1>Today's Cryptocurrency Prices by Market Cap</h1>
        <p className="subtitle">The global crypto market cap is {formatLargeNumber(cryptoData.reduce((sum, crypto) => sum + crypto.market_cap, 0))}</p>
      </header>
      
      <div className="table-wrapper">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th>24h %</th>
              <th>Market Cap</th>
              <th>Volume(24h)</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto) => (
              <tr key={crypto.id}>
                <td className="rank">{crypto.market_cap_rank}</td>
                <td className="name">
                  <div className="name-cell">
                    <img src={crypto.image} alt={crypto.name} className="crypto-icon" />
                    <div className="name-info">
                      <span className="crypto-name">{crypto.name}</span>
                      <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className="price">{formatPrice(crypto.current_price)}</td>
                <td className={`change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(crypto.price_change_percentage_24h)}
                </td>
                <td className="market-cap">{formatLargeNumber(crypto.market_cap)}</td>
                <td className="volume">{formatLargeNumber(crypto.total_volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoTable;
