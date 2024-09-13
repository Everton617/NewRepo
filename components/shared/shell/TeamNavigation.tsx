import { 
    Cog6ToothIcon, BuildingStorefrontIcon ,
    UsersIcon,ArchiveBoxIcon,ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import { MdOutlineDashboard } from "react-icons/md";

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('DashBoard'),
      href: `/teams/${slug}/products`,
      icon: MdOutlineDashboard ,
      active: activePathname === `/teams/${slug}/products`,
    },
    {
      name: t('Gestor de Pedidos'),
      href: `/teams/${slug}/kanban`,
      icon: BuildingStorefrontIcon,
      active: activePathname === `/teams/${slug}/kanban`,
    },
    {
      name: t('Estoque'),
      href: `/teams/${slug}/inventory`,
      icon: ArchiveBoxIcon,
      active: activePathname === `/teams/${slug}/inventory`,
    },
    {
      name: t('Campanhas'),
      href: `/teams/${slug}/scheduleMsg`,
      icon: ChatBubbleOvalLeftEllipsisIcon,
      active: activePathname === `/teams/${slug}/scheduleMsg`,
    },
    {
      name: t('Contatos'),
      href: `/teams/${slug}/contatos`,
      icon: UsersIcon,
      active: activePathname === `/teams/${slug}/contatos`,
    },

    {
      name: t('Configurações'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active: activePathname === `/teams/${slug}/settings`,
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
