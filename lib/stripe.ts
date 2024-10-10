import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';
import { configBilling } from './config';
import { updateUser } from 'models/user';
import { prisma } from '@/lib/prisma';

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
  // Verifique se o cliente já existe no banco de dados  
  const existingUser = await prisma.user.findUnique({  
      where: { id: user.id },  
      select: { billingId: true }  
  });  

  if (existingUser && existingUser.billingId) {  
      // Se o cliente já existe, retorne o billingId existente  
      return existingUser.billingId;  
  }  

  // Dados do cliente a serem enviados para o Stripe  
  const customerData: { metadata: { userId: string }, email: string } = {  
      metadata: { userId: user.id },  
      email: user.email  
  };  

  // Crie um novo cliente no Stripe  
  const customer = await stripe.customers.create({  
      ...customerData,  
      name: user.name  
  });  
  console.log(customer);  

  // Atualize o banco de dados com o billingId do novo cliente  
  const where = { id: user.id };  
  const data = { billingId: customer.id, billingProvider: "stripe" };  
  console.log(await updateUser({ where, data }));  

  return customer.id;  
}  
