export const configBilling = {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      plans: {
        free: {
          priceId: 'price_1PZHgTGyZxV2KIFBrzsfaxb3',
          trialPeriodDays: 10, // Adiciona o período de teste aqui
        },
      },
    },
  };
  