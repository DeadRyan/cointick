import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CoinTick header', () => {
  render(<App />);
  const coinText = screen.getByText('Coin');
  const tickText = screen.getByText('Tick');
  expect(coinText).toBeInTheDocument();
  expect(tickText).toBeInTheDocument();
});

test('renders logo image with correct alt text', () => {
  render(<App />);
  const logoElement = screen.getByAltText('CoinTick Logo');
  expect(logoElement).toBeInTheDocument();
  expect(logoElement).toHaveAttribute('height', '50');
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
