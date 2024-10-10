import  loadStripe  from "stripe";

const stripePromise = new loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default stripePromise;
