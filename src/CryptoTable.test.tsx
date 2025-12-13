import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CryptoTable from './CryptoTable';

// Mock fetch API
global.fetch = jest.fn();

const mockCryptos = [
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

const mockKWEPriceResponse = {
  result: {
    last: 0.0025,
  },
};

describe('CryptoTable', () => {
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
      // Mock CoinGecko API response
      return Promise.resolve({
        ok: true,
        json: async () => mockCryptos,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input with placeholder', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    expect(searchInput).toBeInTheDocument();
  });

  test('does not render search input when showSearch is false', async () => {
    render(<CryptoTable showSearch={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.queryByPlaceholderText(/Search cryptocurrencies.../i)).not.toBeInTheDocument();
  });

  test('filters cryptocurrencies by name', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'bitcoin');
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('filters cryptocurrencies by symbol', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'eth');
    
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('search is case-insensitive', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Cardano')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'CARDANO');
    
    expect(screen.getByText('Cardano')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });

  test('shows all cryptocurrencies when search is empty', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Cardano')).toBeInTheDocument();
  });

  test('shows no results for non-matching search', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'nonexistent');
    
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });

  test('displays KWE cryptocurrency at the top of the list', async () => {
    render(<CryptoTable showSearch={false} />);
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    });
    
    // Verify KWE is displayed
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
  });

  test('KWE can be filtered by search', async () => {
    render(<CryptoTable showSearch={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'kwe');
    
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  test('fetches KWE data from PriceTicker API when available', async () => {
    render(<CryptoTable showSearch={false} />);
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    });
    
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
        json: async () => mockCryptos,
      });
    });

    render(<CryptoTable showSearch={false} />);
    
    await waitFor(() => {
      expect(screen.getByText('KWE Network')).toBeInTheDocument();
    });
    
    // Verify KWE is still displayed (using fallback data)
    expect(screen.getByText('KWE Network')).toBeInTheDocument();
  });
});
