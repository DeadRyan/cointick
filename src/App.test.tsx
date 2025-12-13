import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

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
];

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => mockCryptos,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders CoinTick header', () => {
  render(<App />);
  const coinText = screen.getByText('Coin');
  const tickText = screen.getByText('Tick');
  expect(coinText).toBeInTheDocument();
  expect(tickText).toBeInTheDocument();
});

test('renders hamburger menu button', () => {
  render(<App />);
  const menuButton = screen.getByLabelText('Toggle menu');
  expect(menuButton).toBeInTheDocument();
});

test('renders styled Coin and Tick text', () => {
  render(<App />);
  const coinText = screen.getByText('Coin');
  const tickText = screen.getByText('Tick');
  expect(coinText).toBeInTheDocument();
  expect(tickText).toBeInTheDocument();
  expect(coinText).toHaveClass('coin-text');
  expect(tickText).toHaveClass('tick-text');
});

test('opens menu when hamburger button is clicked', async () => {
  render(<App />);
  const menuButton = screen.getByLabelText('Toggle menu');
  
  // Menu should not be visible initially
  expect(screen.queryByText('Search')).not.toBeInTheDocument();
  
  // Click to open menu
  await userEvent.click(menuButton);
  
  // Menu should now be visible
  expect(screen.getByText('Search')).toBeInTheDocument();
});

test('shows search input when Search menu item is clicked', async () => {
  render(<App />);
  
  
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  }, { timeout: 5000 });
  
  const menuButton = screen.getByLabelText('Toggle menu');
  
  // Open menu
  await userEvent.click(menuButton);
  
  // Click Search menu item
  const searchMenuItem = screen.getByText('Search');
  await userEvent.click(searchMenuItem);
  
  // Search input should now be visible
  expect(screen.getByPlaceholderText(/Search cryptocurrencies.../i)).toBeInTheDocument();
});

test('closes menu when Search menu item is clicked', async () => {
  render(<App />);
  
  
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  }, { timeout: 5000 });
  
  const menuButton = screen.getByLabelText('Toggle menu');
  
  // Open menu
  await userEvent.click(menuButton);
  expect(screen.getByText('Search')).toBeInTheDocument();
  
  // Click Search menu item
  const searchMenuItem = screen.getByText('Search');
  await userEvent.click(searchMenuItem);
  
  // Menu should be closed
  expect(screen.queryByText('Search')).not.toBeInTheDocument();
});
