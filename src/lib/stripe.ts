export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(priceInCents / 100);
};

export type Product = {
  id: string;
  name: string;
  price: number;
  credits: number;
  active: boolean;
};

export const fetchProducts = async (authHeader: any): Promise<Product[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/payment/products`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch products');
  }

  return data.data;
};

export const createPaymentIntent = async (
  productId: string,
  authHeader: any
): Promise<{
  clientSecret: string;
  amount: number;
  currency: string;
  credits: number;
  productName: string;
}> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/payment/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify({ product_id: productId }),
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create payment intent');
  }

  return data.data;
};