export interface KWEPriceResponse {
  result: {
    last: number | string;
  };
}

export const fetchKWEPrice = async (): Promise<number> => {
  const response = await fetch('https://kwepriceticker.com/api/price');
  
  if (!response.ok) {
    throw new Error('Failed to fetch KWE price');
  }
  
  const data: KWEPriceResponse = await response.json();
  
  // Parse the value to ensure it's a number (API returns string)
  const parsedPrice = parseFloat(data.result.last as any);
  
  // Return 0 if parsing fails (NaN) or if value is null/undefined
  if (isNaN(parsedPrice)) {
    return 0;
  }
  
  return parsedPrice;
};
