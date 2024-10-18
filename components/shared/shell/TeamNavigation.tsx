import { 
    Cog6ToothIcon ,
    UsersIcon,ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';
import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { TbBuildingWarehouse } from "react-icons/tb";
import { LuCalendarSearch } from "react-icons/lu";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";


interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('DashBoard'),
      href: `/teams/${slug}/dashboard`,
      icon: MdOutlineDashboard ,
      active: activePathname === `/teams/${slug}/dashboard`,
    },
    {
      name: t('Gestor de Pedidos'),
      href: `/teams/${slug}/kanban`,
      icon: LiaChalkboardTeacherSolid ,
      active: activePathname === `/teams/${slug}/kanban`,
    },
    {
      name: t('Estoque'),
      href: `/teams/${slug}/inventory`,
      icon: TbBuildingWarehouse,
      active: activePathname === `/teams/${slug}/inventory`,
    },
    {
      name: t('Histórico'),
      href: `/teams/${slug}/historic`,
      icon: LuCalendarSearch ,
      active: activePathname === `/teams/${slug}/historic`,
    },
    {
      name: t('Entregadores'),
      href: `/teams/${slug}/deliveryman`,
      icon: MdOutlineDeliveryDining,
      active: activePathname === `/teams/${slug}/deliveryman`,
    },
   /* {
      name: t('Campanhas'),
      href: `/teams/${slug}/scheduleMsg`,
      icon: ChatBubbleOvalLeftEllipsisIcon,
      active: activePathname === `/teams/${slug}/scheduleMsg`,
    }, */
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
