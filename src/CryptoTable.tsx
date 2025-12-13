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
        
        // Fetch KWE market data from Coinranking API
        // Note: Using a placeholder for API key. Get a free key from https://developers.coinranking.com/
        const coinrankingHeaders: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        // Add API key if available from environment variable
        const apiKey = process.env.REACT_APP_COINRANKING_API_KEY;
        if (apiKey) {
          coinrankingHeaders['x-access-token'] = apiKey;
        }
        
        let marketCap = 0;
        let priceChange24h = 0;
        let volume24h = 0;
        
        try {
          const coinrankingResponse = await fetch(
            'https://api.coinranking.com/v2/coin/L_vX2sFWI',
            { headers: coinrankingHeaders }
          );
          
          if (coinrankingResponse.ok) {
            const coinrankingData = await coinrankingResponse.json();
            if (coinrankingData?.data?.coin) {
              const coin = coinrankingData.data.coin;
              marketCap = parseFloat(coin.marketCap) || 0;
              priceChange24h = parseFloat(coin.change) || 0;
              volume24h = parseFloat(coin['24hVolume']) || 0;
            }
          }
        } catch (err) {
          // Silently fail and use default values if Coinranking API fails
          console.warn('Failed to fetch KWE data from Coinranking API:', err);
        }
        
        // Return KWE data with the fetched price and market data
        return {
          id: 'kwe',
          name: 'KWE Network',
          symbol: 'kwe',
          image: '/kwe-logo.svg',
          current_price: price,
          price_change_percentage_24h: priceChange24h,
          market_cap: marketCap,
          total_volume: volume24h,
          market_cap_rank: 1777,
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
          market_cap_rank: 1777,
        };
      }
    };

    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        
        // Fetch KWE data first
        const kweData = await fetchKWEData();
        
        // Fetch 8 pages of CoinGecko data sequentially with delay to avoid rate limits
        // This fetches 2000 coins total (8 pages × 250 coins/page)
        const pages = [1, 2, 3, 4, 5, 6, 7, 8];
        const allCoins: Cryptocurrency[] = [];
        let successfulPages = 0;
        
        for (const page of pages) {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`
            );
            
            if (!response.ok) {
              // If we get a rate limit error, stop fetching more pages
              if (response.status === 429) {
                console.warn(`Rate limit reached at page ${page}, using ${successfulPages} pages`);
                break;
              }
              throw new Error(`Failed to fetch page ${page}`);
            }
            
            const data: Cryptocurrency[] = await response.json();
            allCoins.push(...data);
            successfulPages++;
            
            // Add 1 second delay between requests to stay under rate limits
            // (CoinGecko free tier: 10-30 calls/min)
            if (page < pages.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (err) {
            // Log error but continue with whatever data we have
            console.error(`Error fetching page ${page}:`, err);
            // If we have some data, continue; otherwise break
            if (successfulPages === 0) {
              throw err;
            }
            break;
          }
        }
        
        // Deduplicate by coin ID (in case of duplicates)
        const uniqueCoins = Array.from(
          new Map(allCoins.map(coin => [coin.id, coin])).values()
        );
        
        // Sort by market_cap_rank ascending (lower rank number = higher position)
        uniqueCoins.sort((a, b) => {
          const rankA = a.market_cap_rank ?? Infinity;
          const rankB = b.market_cap_rank ?? Infinity;
          return rankA - rankB;
        });
        
        // Insert KWE at the correct position (index 1776 for rank 1777)
        // Find the index where KWE should be inserted based on its rank
        const insertIndex = uniqueCoins.findIndex(coin => 
          (coin.market_cap_rank ?? Infinity) > 1777
        );
        
        // If insertIndex is -1, KWE goes at the end; otherwise insert at that index
        const finalCoins = [...uniqueCoins];
        if (insertIndex === -1) {
          finalCoins.push(kweData);
        } else {
          finalCoins.splice(insertIndex, 0, kweData);
        }
        
        setCryptos(finalCoins);
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
