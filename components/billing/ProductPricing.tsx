import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { Price } from '@prisma/client';
import PaymentButton from './PaymentButton';
import { Service, Subscription } from '@prisma/client';


interface ProductPricingProps {
  plans: any[];
  subscriptions: (Subscription & { product: Service })[];
}

const ProductPricing = ({ plans, subscriptions }: ProductPricingProps) => {
  const { t } = useTranslation('common');

  const initiateCheckout = async (price: string, quantity?: number) => {
    const res = await fetch(
      `/api/payments/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price, quantity }),
      }
    );

    const data = await res.json();

    if (data?.data?.url) {
      window.open(data.data.url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error(
        data?.error?.message ||
        data?.error?.raw?.message ||
        t('stripe-checkout-fallback-error')
      );
    }
  };

  const hasActiveSubscription = (price: Price) =>
    subscriptions.some((s) => s.priceId === price.id);


  return (
    <section className="py-3 flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 md:gap-6" style={{ maxWidth: "1400px" }}>
        {plans.map((plan) => {


          return (
            <div
              className="relative rounded-md bg-white border-2 "
              style={{ minHeight: "730px", minWidth:"240px" }}
              key={plan.id}
            >
              <div className="p-8">


                <div>
                  <p className="text-gray-500">
                    {plan.prices.map((price: Price) => (
                      <div className=' flex ' key={price.id}>
                        <span className='text-2xl font-bold text-black'>{t('R$ ')}</span>
                        <div className='flex  w-full font-bold text-6xl text-black'style={{ minWidth: "180px" }} >
                          {price.amount}
                          <div className='text-sm w-full pt-9'>
                            {t('/por mês ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </p>
                </div>

                <div className="flex items-center  pb-2 mb-2" style={{ height: "50px" }}>

                  <h3 className="font-display text-2xl font-bold  text-gray-700">
                    {plan.name}
                  </h3>
                </div>

                <div className='flex ' style={{ minHeight: "10px"  }}>
                  <p className=" text-gray-900 "style={{ minHeight: "10px" }}>{plan.description}</p>
                </div>



              </div>

              <div className='border  w-80 mx-auto'></div>

              <ul className="flex flex-col justify-center mb-10 mt-5 space-y-4 px-8 " style={{ minHeight: "300px" }}>
                {plan.features.map((feature: string) => (
                  <li className="flex space-x-4" key={`${plan.id}-${feature}`}>
                    <div className="w-6 h-6 min-w-[24px] min-h-[24px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-full h-full text-red-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                        />
                      </svg>
                    </div>

                    <p className="text-gray-600">{feature}</p>
                  </li>
                ))}
              </ul>

              <div className="flex justify-center flex-col gap-2 border-gray-200 px-8 h-10">
                {plan.prices.map((price: Price) =>
                  hasActiveSubscription(price) ? (
                    <Button
                      key={price.id}
                      variant="outline"
                      size="md"
                      fullWidth
                      disabled
                      className=""
                    >
                      {t('Plano atual')}
                    </Button>
                  ) : (
                    <PaymentButton
                      key={price.id}
                      plan={plan}
                      price={price}
                      initiateCheckout={initiateCheckout}
                    />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductPricing;