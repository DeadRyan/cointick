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

describe('CryptoTable', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCryptos,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input with placeholder', async () => {
    render(<CryptoTable />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    expect(searchInput).toBeInTheDocument();
  });

  test('filters cryptocurrencies by name', async () => {
    render(<CryptoTable />);
    
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
    render(<CryptoTable />);
    
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
    render(<CryptoTable />);
    
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
    render(<CryptoTable />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Cardano')).toBeInTheDocument();
  });

  test('shows no results for non-matching search', async () => {
    render(<CryptoTable />);
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Search cryptocurrencies.../i);
    await userEvent.type(searchInput, 'nonexistent');
    
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    expect(screen.queryByText('Cardano')).not.toBeInTheDocument();
  });
});
