export interface KWEPriceResponse {
  result: {
    last: number;
  };
}

export const fetchKWEPrice = async (): Promise<number> => {
  const response = await fetch('https://kwepriceticker.com/api/price');
  
  if (!response.ok) {
    throw new Error('Failed to fetch KWE price');
  }
  
  const data: KWEPriceResponse = await response.json();
  
  return data.result.last || 0;
};
