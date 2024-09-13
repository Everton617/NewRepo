import {
  RectangleStackIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { MenuItem, NavigationProps } from './NavigationItems';

const UserNavigation = ({ activePathname }: NavigationProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('Todos os times'),
      href: '/teams',
      icon: RectangleStackIcon,
      active: activePathname === '/teams',
    },
    {
      name: t('Conta'),
      href: '/settings/account',
      icon: UserCircleIcon,
      active: activePathname === '/settings/account',
    },
    {
      name: t('Planos'),
      href: '/plans',
      icon: CreditCardIcon,
      active: activePathname === '/plans',
    },
    {
      name: t('Segurança'),
      href: '/settings/security',
      icon: ShieldCheckIcon,
      active: activePathname === '/settings/security',
    }
  ];

  return <NavigationItems menus={menus} />;
};

export default UserNavigation;
