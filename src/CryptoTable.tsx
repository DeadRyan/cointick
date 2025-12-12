import React, { useState, useEffect } from 'react';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
}

const CryptoTable: React.FC = () => {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
        setCryptos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num == null) return 'N/A';
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    }
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatPrice = (price: number): string => {
    if (price == null) return 'N/A';
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  if (loading) {
    return <div className="loading">Loading cryptocurrency data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <table className="crypto-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th className="text-right">Price</th>
            <th className="text-right">24h Change</th>
            <th className="text-right">Market Cap</th>
            <th className="text-right">24h Volume</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td>{crypto.market_cap_rank}</td>
              <td>
                <div className="crypto-name">
                  <img src={crypto.image} alt={`${crypto.name} logo`} className="crypto-logo" />
                  <span>
                    {crypto.name}
                    <span className="crypto-symbol">{crypto.symbol}</span>
                  </span>
                </div>
              </td>
              <td className="text-right">{formatPrice(crypto.current_price)}</td>
              <td className={`text-right ${crypto.price_change_percentage_24h != null && crypto.price_change_percentage_24h >= 0 ? 'price-change-positive' : 'price-change-negative'}`}>
                {crypto.price_change_percentage_24h != null ? (
                  <>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </>
                ) : 'N/A'}
              </td>
              <td className="text-right">{formatNumber(crypto.market_cap)}</td>
              <td className="text-right">{formatNumber(crypto.total_volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoTable;
