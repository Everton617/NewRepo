import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';
import { configBilling } from './config';
import { updateUser } from 'models/user';

export const stripe = new Stripe(env.stripe.secretKey ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2024-04-10',
});

export async function getStripeCustomerId(teamMember: any, session?: any) {
  let customerId = '';
  const { priceId, trialPeriodDays } = configBilling.stripe.plans.free;

  if (!teamMember.team.billingId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) {
      customerData.email = session?.user?.email;
    }
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: trialPeriodDays,
      
    });
    await updateTeam(teamMember.team.slug, {
      billingId: customer.id,
      billingProvider: 'stripe',
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.billingId;
  }
  return customerId;
}

export async function getUserStripeCustomerId(user: any) {
    if (user.billingId) return user.billingId; 

    const { priceId, trialPeriodDays } = configBilling.stripe.plans.free;

    const customerData: {metadata: {userId: string}, email: string} = {
        metadata: {
            userId: user.id
        }, email: user.email
    };

    const customer = await stripe.customers.create({
        ...customerData,
        name: user.name
    });
    console.log(customer);

    await stripe.subscriptions.create({
        customer: customer.id,
        items: [{price: priceId}],
        trial_period_days: trialPeriodDays
    });

    const where = { id: user.id };
    const data = { billingId: customer.id, billingProvider: "stripe" };

    console.log(await updateUser({where, data}));
    
    return customer.id;
}
