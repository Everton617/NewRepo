import { useTranslation } from 'next-i18next';

import { Service, Subscription } from '@prisma/client';

interface SubscriptionsProps {
  subscriptions: (Subscription & { product: Service })[];
}

const Subscriptions = ({ subscriptions }: SubscriptionsProps) => {
  const { t } = useTranslation('common');

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="card-title text-xl font-medium leading-none tracking-tight">
        {t('Assinaturas')}
      </h2>
      <table className="table w-full text-sm border">
        <thead className='bg-red-400 text-white'>
          <tr>
            <th>ID</th>
            <th>{t('Plano')}</th>
            <th>{t('Data de Inscrição')}</th>
            <th>{t('Válido até')}</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td>{subscription.id}</td>
              <td>{subscription.product.name}</td>
              <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
              <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subscriptions;
