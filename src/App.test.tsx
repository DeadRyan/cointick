import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders cryptocurrency prices header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Today's Cryptocurrency Prices/i);
  expect(headerElement).toBeInTheDocument();
});
