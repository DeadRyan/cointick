import { fetchKWEPrice } from './PriceTicker';

// Mock fetch API
global.fetch = jest.fn();

describe('PriceTicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchKWEPrice', () => {
    it('should return a number when API returns a string price', async () => {
      // Mock API response with string (as the real API does)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            last: '0.0025', // String value as returned by the real API
          },
        }),
      });

      const price = await fetchKWEPrice();
      
      expect(typeof price).toBe('number');
      expect(price).toBe(0.0025);
    });

    it('should return a number when API returns a numeric price', async () => {
      // Mock API response with number (for backward compatibility)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            last: 0.0025, // Numeric value
          },
        }),
      });

      const price = await fetchKWEPrice();
      
      expect(typeof price).toBe('number');
      expect(price).toBe(0.0025);
    });

    it('should return 0 when API returns invalid/non-numeric string', async () => {
      // Mock API response with invalid string
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            last: 'invalid',
          },
        }),
      });

      const price = await fetchKWEPrice();
      
      expect(price).toBe(0);
    });

    it('should return 0 when API returns null or undefined', async () => {
      // Mock API response with null
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            last: null,
          },
        }),
      });

      const price = await fetchKWEPrice();
      
      expect(price).toBe(0);
    });

    it('should throw error when API request fails', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchKWEPrice()).rejects.toThrow('Failed to fetch KWE price');
    });

    it('should parse scientific notation strings correctly', async () => {
      // Mock API response with scientific notation string
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            last: '2.5e-3', // Scientific notation
          },
        }),
      });

      const price = await fetchKWEPrice();
      
      expect(typeof price).toBe('number');
      expect(price).toBe(0.0025);
    });
  });
});
