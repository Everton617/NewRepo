import useSWR from 'swr';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';


import Help from '@/components/billing/Help';
import { Error, Loading } from '@/components/shared';
import LinkToPortal from '@/components/billing/LinkToPortal';
import Subscriptions from '@/components/billing/Subscriptions';
import ProductPricing from '@/components/billing/ProductPricing';

const Payments = () => {
  
  const { isLoading, isError } = useTeam();
  const { data } = useSWR(
   '/api/payments/products',
    fetcher
  );

  console.log(data)

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }


  const plans = data?.data?.products || [];
  const subscriptions = data?.data?.subscriptions || [];

  console.log(plans)
  console.log(subscriptions)

  return (
    <>
     
        <>
          <div className="flex gap-6 flex-col md:flex-row">
          <LinkToPortal  />
            <Help />
          </div>

          <div className="py-6">
            <Subscriptions subscriptions={subscriptions} />
          </div>

          <ProductPricing plans={plans} subscriptions={subscriptions} />
          
        </>
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.payments) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Payments;
