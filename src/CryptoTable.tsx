import React, { useState, useEffect, useMemo } from 'react';
import { fetchKWEPrice } from './PriceTicker';

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number | null;
}

interface CryptoTableProps {
  showSearch: boolean;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ showSearch }) => {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kwePrice, setKwePrice] = useState<number>(0);

  useEffect(() => {
    const fetchKWEData = async (): Promise<Cryptocurrency> => {
      try {
        // Fetch KWE price from the PriceTicker API
        const price = await fetchKWEPrice();
        
        // Update the KWE price state for periodic updates
        setKwePrice(price);
        
        // Return KWE data with the fetched price
        return {
          id: 'kwe',
          name: 'KWE Network',
          symbol: 'kwe',
          image: '/kwe-logo.svg',
          current_price: price,
          price_change_percentage_24h: 0, // N/A - not available from API
          market_cap: 0, // N/A - not available from API
          total_volume: 0, // N/A - not available from API
          market_cap_rank: null,
        };
      } catch (error) {
        // Fall back to placeholder data if API request fails
        return {
          id: 'kwe',
          name: 'KWE Network',
          symbol: 'kwe',
          image: '/kwe-logo.svg',
          current_price: 0,
          price_change_percentage_24h: 0,
          market_cap: 0,
          total_volume: 0,
          market_cap_rank: null,
        };
      }
    };

    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        
        // Fetch KWE data and all 8 pages of CoinGecko data in parallel
        const pages = [1, 2, 3, 4, 5, 6, 7, 8];
        const fetchPromises = pages.map(page =>
          fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`)
        );
        
        const [kweData, ...coingeckoResponses] = await Promise.all([
          fetchKWEData(),
          ...fetchPromises
        ]);
        
        // Check if any response failed
        for (const response of coingeckoResponses) {
          if (!response.ok) {
            throw new Error('Failed to fetch cryptocurrency data');
          }
        }
        
        // Parse all responses
        const dataArrays = await Promise.all(
          coingeckoResponses.map(response => response.json())
        );
        
        // Flatten and sort by market cap
        const allCoins = dataArrays.flat();
        
        // Deduplicate by coin ID (in case of overlapping pages or duplicates)
        const uniqueCoins = Array.from(
          new Map(allCoins.map(coin => [coin.id, coin])).values()
        );
        
        // Sort by market cap
        uniqueCoins.sort((a, b) => {
          return (b.market_cap || 0) - (a.market_cap || 0);
        });
        
        // Add KWE at the top of the list
        setCryptos([kweData, ...uniqueCoins]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Update KWE price every 30 seconds
  useEffect(() => {
    const updateKWEPrice = async () => {
      try {
        const price = await fetchKWEPrice();
        setKwePrice(price);
      } catch (error) {
        // Silently fail, keep the previous price
      }
    };

    // Set up interval to update price every 30 seconds
    const interval = setInterval(updateKWEPrice, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Update cryptos when KWE price changes
  // Note: Only updates when kwePrice > 0 to avoid showing fallback/error values
  useEffect(() => {
    if (kwePrice > 0) {
      setCryptos(prevCryptos => {
        if (prevCryptos.length === 0) return prevCryptos;
        
        // Find the current KWE entry
        const currentKWE = prevCryptos.find(crypto => crypto.id === 'kwe');
        
        // Only update if the price has changed
        if (currentKWE && currentKWE.current_price === kwePrice) {
          return prevCryptos;
        }
        
        const updated = prevCryptos.map(crypto => {
          if (crypto.id === 'kwe') {
            return { ...crypto, current_price: kwePrice };
          }
          return crypto;
        });
        return updated;
      });
    }
  }, [kwePrice]);

  const formatNumber = (num: number): string => {
    if (num == null || num === 0) return 'N/A';
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
    if (price == null || price === 0) return 'N/A';
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
