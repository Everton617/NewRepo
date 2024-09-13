import env from '@/lib/env';
import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

export const stripe = new Stripe(env.stripe.secretKey ?? '', {
  apiVersion: '2024-04-10',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
    });

    const defaultPrices = prices.data.filter(price => {
      const product = price.product as Stripe.Product;
      return price.id === product.default_price && price.active && product.active;
    });

    const plans = defaultPrices.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        product: {
          name: product.name,
          description: product.description,
        },
        currency: price.currency,
        unit_amount: price.unit_amount,
      };
    });

    res.status(200).json(plans);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}
