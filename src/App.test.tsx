import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch for tests
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockClear();
});

test('renders homepage with loading state initially', () => {
  (fetch as jest.Mock).mockImplementation(() => 
    new Promise(() => {}) // Never resolves to keep loading state
  );
  
  render(<App />);
  const loadingElement = screen.getByText(/loading cryptocurrency data/i);
  expect(loadingElement).toBeInTheDocument();
});

test('renders cryptocurrency table when data is loaded', async () => {
  const mockData = [
    {
      id: 'bitcoin',
      market_cap_rank: 1,
      name: 'Bitcoin',
      symbol: 'btc',
      image: 'https://example.com/btc.png',
      current_price: 50000,
      price_change_percentage_24h: 5.5,
      market_cap: 1000000000000,
      total_volume: 50000000000
    }
  ];

  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockData
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });

  expect(screen.getByText(/btc/i)).toBeInTheDocument();
  expect(screen.getByText('$50,000.00')).toBeInTheDocument();
});

test('renders error message when API fails', async () => {
  (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
