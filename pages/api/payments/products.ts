import { NextApiRequest, NextApiResponse } from 'next';
import { getUserStripeCustomerId } from '@/lib/stripe';
import { getAllServices } from 'models/service';
import { getAllPrices } from 'models/price';
import { getByCustomerId } from 'models/subscription';
import { getCurrentUser } from 'models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUser(req, res);
  if (!user) {
    throw Error('Could not get user');
  }
  
  const customerId = await getUserStripeCustomerId(user);

  const [subscriptions, products, prices] = await Promise.all([
    getByCustomerId(customerId),
    getAllServices(),
    getAllPrices(),
  ]);

  // create a unified object with prices associated with the product
  const productsWithPrices = products.map((product: any) => {
    product.prices = prices.filter((price) => price.serviceId === product.id);
    return product;
  });

  // Subscriptions with product and price
  const _subscriptions: any[] = subscriptions.map((subscription: any) => {
    const _price = prices.find((p) => p.id === subscription.priceId);
    if (!_price) {
      return undefined;
    }
    const subscriptionProduct = products.find((p) => p.id === _price.serviceId);

    return {
      ...subscription,
      product: subscriptionProduct,
      price: _price,
    };
  });

  console.log({
    data: {
      products: productsWithPrices,
      subscriptions: (_subscriptions || []).filter((s) => !!s),
    },
  })

  res.json({
    data: {
      products: productsWithPrices,
      subscriptions: (_subscriptions || []).filter((s) => !!s),
    },
  });
};
