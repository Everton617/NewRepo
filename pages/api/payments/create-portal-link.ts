import { NextApiRequest, NextApiResponse } from 'next';

import { stripe, getUserStripeCustomerId } from '@/lib/stripe';
import env from '@/lib/env';
import { getCurrentUser } from 'models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUser(req, res);
  if (!user) {
    throw Error('Could not get user');
  }
  const customerId = await getUserStripeCustomerId(user);

  const { url } = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/plans`,
  });

  res.json({ data: { url } });
};
