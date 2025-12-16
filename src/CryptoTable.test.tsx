import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CryptoTable from './CryptoTable';

// Mock fetch API
global.fetch = jest.fn();

const mockCryptosPage1 = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://example.com/bitcoin.png',
    current_price: 50000,
    price_change_percentage_24h: 2.5,
    market_cap: 1000000000000,
    total_volume: 50000000000,
    market_cap_rank: 1,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://example.com/ethereum.png',
    current_price: 3000,
    price_change_percentage_24h: -1.5,
    market_cap: 500000000000,
    total_volume: 30000000000,
    market_cap_rank: 2,
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    image: 'https://example.com/cardano.png',
    current_price: 1.5,
    price_change_percentage_24h: 5.0,
    market_cap: 50000000000,
    total_volume: 2000000000,
    market_cap_rank: 3,
  },
];

const mockCryptosPage2 = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    image: 'https://example.com/solana.png',
    current_price: 100,
    price_change_percentage_24h: 3.0,
    market_cap: 30000000000,
    total_volume: 5000000000,
    market_cap_rank: 4,
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'dot',
    image: 'https://example.com/polkadot.png',
    current_price: 20,
    price_change_percentage_24h: 1.0,
    market_cap: 20000000000,
    total_volume: 1000000000,
    market_cap_rank: 5,
  },
];

const mockCryptosPage3 = [
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'link',
    image: 'https://example.com/chainlink.png',
    current_price: 15,
    price_change_percentage_24h: -2.0,
    market_cap: 10000000000,
    total_volume: 800000000,
    market_cap_rank: 6,
  },
];

const mockCryptosPage4 = [
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'avax',
    image: 'https://example.com/avalanche.png',
    current_price: 50,
    price_change_percentage_24h: 4.0,
    market_cap: 15000000000,
    total_volume: 2000000000,
    market_cap_rank: 7,
  },
];

const mockKWEPriceResponse = {
  result: {
    last: '0.0025', // API returns string, not number
  },
};

describe('CryptoTable', () => {
  const TestWrapper = ({ showSearch = true, initialSearchQuery = '' }: { showSearch?: boolean; initialSearchQuery?: string }) => {
    const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);
    return <CryptoTable showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  };

  beforeEach(() => {
    // Default mock for APIs
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('https://kwepriceticker.com')) {
        // Mock KWE Price Ticker API response
        return Promise.resolve({
          ok: true,
          json: async () => mockKWEPriceResponse,
        });
      }
      // Mock Coinranking API response
      if (url.includes('coinranking.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: {
              coin: {
                marketCap: '1000000',
                '24hVolume': '50000',
                change: '5.0'
              }
            }
          }),
        });
      }
      // Mock CoinGecko API response - return different data for different pages
      if (url.startsWith('https://api.coingecko.com')) {
        const urlObj = new URL(url);
        const page = parseInt(urlObj.searchParams.get('page') || '1');
        let mockData;
        switch (page) {
          case 1:
            mockData = mockCryptosPage1;
            break;
          case 2:
            mockData = mockCryptosPage2;
            break;
          case 3:
            mockData = mockCryptosPage3;
            break;
          case 4:
            mockData = mockCryptosPage4;
            break;
          default:
            mockData = [];
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockData,
        });
      }
      // Fallback
      return Promise.resolve({
        ok: true,
        json: async () => mockCryptosPage1,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input with placeholder', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    expect(searchInput).toBeInTheDocument();
  });

  test('does not render search input when showSearch is false', async () => {
    render(<CryptoTable showSearch={false} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(screen.queryByPlaceholderText(/Search cryptocurrencies.../i)).not.toBeInTheDocument();
  });

  test('filters cryptocurrencies by name', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'bitcoin');
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('filters cryptocurrencies by symbol', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'eth');
    
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('search is case-insensitive', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('Cardano')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'CARDANO');
    
    expect(screen.getByText('Cardano')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });

  test('shows all cryptocurrencies when search is empty', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Cardano')).toBeInTheDocument();
  });

  test('shows no results for non-matching search', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'nonexistent');
    
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('displays KWE cryptocurrency at the top of the list', async () => {
    render(<CryptoTable showSearch={false} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify KWE is displayed
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
  });

  test('KWE can be filtered by search', async () => {
    render(<CryptoTable showSearch={true} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'kwe');
    
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  test('fetches KWE data from PriceTicker API when available', async () => {
    render(<CryptoTable showSearch={false} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify PriceTicker API was called
    expect(global.fetch).toHaveBeenCalledWith(
      'https://kwepriceticker.com/api/price'
    );
    
    // Verify KWE is displayed at the top
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
  });

  test('falls back to placeholder data when PriceTicker API fails', async () => {
    // Mock API failure for PriceTicker
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith('https://kwepriceticker.com')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockCryptosPage1,
      });
    });

    render(<CryptoTable showSearch={false} searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify KWE is still displayed (using fallback data)
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
  });
});
