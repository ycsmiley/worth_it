import { loadStripe } from '@stripe/stripe-js';
import { products, ProductId } from '../stripe-config';
import { supabase } from './supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(productId: ProductId) {
  const product = products[productId];
  
  if (!product) {
    throw new Error('Invalid product');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        price_id: product.priceId,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
        mode: product.mode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    
    if (!url) {
      throw new Error('No checkout URL returned');
    }

    window.location.href = url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export { stripePromise };