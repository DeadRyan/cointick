import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders cryptocurrency prices header', async () => {
  render(<App />);
  
  // Wait for the header to appear after loading
  const headerElement = await screen.findByText(/Today's Cryptocurrency Prices/i);
  expect(headerElement).toBeInTheDocument();
});
