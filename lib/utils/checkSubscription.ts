import { getUserStripeCustomerId } from '@/lib/stripe';  
import { getByCustomerId } from 'models/subscription';  
  
export async function checkUserSubscription(session, req) {  
  if (!session.user) {  
    const redirectUrl = new URL('/login', req.url); // Atualize esta URL conforme necessário  
    return { redirect: redirectUrl };  
  }  
    
  const user = session.user;  
  const customerId = await getUserStripeCustomerId(user);  
  const subscriptions = await getByCustomerId(customerId);  
  const hasActiveSubscription = subscriptions.some(subscription => subscription.active);  
    
  if (!hasActiveSubscription) {  
    const noSubscriptionUrl = new URL('/no-subscription', req.url); // Atualize esta URL conforme necessário  
    return { redirect: noSubscriptionUrl };  
  }  
  
  return { valid: true };  
}  
