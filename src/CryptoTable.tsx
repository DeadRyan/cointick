import React, { useState, useEffect, useMemo } from 'react';

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

interface CryptoTableProps {
  showSearch: boolean;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ showSearch }) => {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        
        // Add KWE cryptocurrency with placeholder data
        const kweData: Cryptocurrency = {
          id: 'kwe',
          name: 'KWE Network',
          symbol: 'kwe',
          image: '/kwe-logo.svg',
          current_price: 0.0025,
          price_change_percentage_24h: 3.45,
          market_cap: 1250000,
          total_volume: 75000,
          market_cap_rank: 0,
        };
        
        // Add KWE at the top of the list
        setCryptos([kweData, ...data]);
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

  const getPriceChangeClass = (value: number | null | undefined): string => {
    if (value == null) return 'text-right';
    return `text-right ${value >= 0 ? 'price-change-positive' : 'price-change-negative'}`;
  };

  const filteredCryptos = useMemo(() => {
    return cryptos.filter((crypto) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        crypto.name.toLowerCase().includes(searchLower) ||
        crypto.symbol.toLowerCase().includes(searchLower)
      );
    });
  }, [cryptos, searchQuery]);

  if (loading) {
    return <div className="loading">Loading cryptocurrency data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      {showSearch && (
        <input
          type="text"
          className="search-input"
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}
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
          {filteredCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td>{crypto.market_cap_rank || '-'}</td>
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
              <td className={getPriceChangeClass(crypto.price_change_percentage_24h)}>
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
