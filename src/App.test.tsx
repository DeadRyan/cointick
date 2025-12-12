import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CoinTick header', () => {
  render(<App />);
  const headerElement = screen.getByText(/CoinTick/i);
  expect(headerElement).toBeInTheDocument();
});
