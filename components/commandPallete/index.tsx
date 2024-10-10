import { useEffect, useState } from "react";
import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";
import "react-cmdk/dist/cmdk.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import { useSession } from "next-auth/react";
import { Cog6ToothIcon, BuildingStorefrontIcon, UsersIcon, ArchiveBoxIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { HiMiniUserGroup } from "react-icons/hi2";
import useTheme from 'hooks/useTheme';
import { IoIosLogOut } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";
import { signOut } from "next-auth/react";

const CommandPallete = () => {
  const [page, setPage] = useState<"root" | "projects">("root");
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation('common');
  const { teams } = useTeams();
  const { data: session, status } = useSession();
  const { toggleTheme } = useTheme();



  useEffect(() => {
    // Retrieve the state from local storage  
    const storedState = localStorage.getItem('NEXT_PUBLIC_COMMAND_PALETTE_ACTIVE');
    console.log('Stored State:', storedState);
    setOpen(storedState === 'true');

    function handleKeyDown(e: KeyboardEvent) {
      if (
        (navigator?.platform?.toLowerCase().includes("mac") ? e.metaKey : e.ctrlKey) &&
        e.key === "k"
      ) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((currentValue) => {
          const newValue = !currentValue;
          localStorage.setItem('NEXT_PUBLIC_COMMAND_PALETTE_ACTIVE', newValue.toString());
          return newValue;

        }
        );
      }
    }
    if (storedState === 'true') {
      console.log('Command Palette is active');
    } else {
      console.log('Command Palette is inactive');
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, []);



  if (status === 'loading') {
    return null; // Or a loading spinner  
  }

  if (!session) {
    return null; // Or a message indicating the user needs to log in  
  }


  const filteredItems = filterItems(
    [
      {
        heading: "Navegação do usuário",
        id: "home",
        items: [
          {
            id: "all-teams",
            children: "Todos os times",
            icon: FaPeopleGroup,
            href: "/teams",
          },
          {
            id: "account",
            children: "Conta",
            icon: "UserIcon",
            href: "/settings/account",
          },
          {
            id: "plans",
            children: "Planos",
            icon: "CreditCardIcon",
            href: "/plans"
          },
          {
            id: "security",
            children: "Segurança",
            icon: "ShieldCheckIcon",
            href: "/settings/security",
          },
          {
            id: "toggle-theme",
            children: "Trocar tema",
            icon: "SunIcon",
            closeOnSelect: false,
            onClick: () => {
              toggleTheme
            },
          },
          {
            id: "logout",
            children: "Deslogar",
            icon: IoIosLogOut,
            closeOnSelect: false,
            onClick: () => {
              signOut();
            },
          },
        ],
      },
      {
        heading: "Navegação da Empresa",
        id: "all-teams",
        items: teams ? teams.map((team) => ({
          id: team.name,
          children: (
            <Accordion type="single" collapsible className=" min-w-[200px]">
              <AccordionItem value={team.name} className="border-1 text-white ">
                <AccordionTrigger>
                  <div className="hover:outline-none flex flex-row items-center justify-center gap-3">
                    <HiMiniUserGroup className="w-5 h-5 text-gray-500" />{team.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <BuildingStorefrontIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/kanban`} className="text-[16px] hover:border-b hover:border-b-2">{t('Gestor de Pedidos')}</a>
                    </div>
                    <div className="flex gap-2">
                      <ArchiveBoxIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/inventory`} className="text-[16px] hover:border-b hover:border-b-2">{t('Estoque')}</a>
                    </div>
                    <div className="flex gap-2">
                      <ArchiveBoxIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/historic`} className="text-[16px] hover:border-b hover:border-b-2">{t('Histórico')}</a>
                    </div>
                    <div className="flex gap-2">
                      <ArchiveBoxIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/deliveryman`} className="text-[16px] hover:border-b hover:border-b-2">{t('Deliveryman')}</a>
                    </div>
                    <div className="flex gap-2">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                      <a href={`/teams/${team.name}/scheduleMsg`} className="text-[16px] hover:border-b hover:border-b-2">{t('Campanhas')}</a>
                    </div>
                    <div className="flex gap-2">
                      <UsersIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/contatos`} className="text-[16px] hover:border-b hover:border-b-2">{t('Contatos')}</a>
                    </div>
                    <div className="flex gap-2">
                      <Cog6ToothIcon className="w-6 h-6" />
                      <a href={`/teams/${team.name}/settings`} className="text-[16px] hover:border-b hover:border-b-2">{t('Configurações')}</a>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        })) : [],
      },
    ],
    search
  );

  return (
    <CommandPalette
      onChangeSearch={setSearch}
      onChangeOpen={setOpen}
      search={search}
      isOpen={open}
      page={page}
    >
      <CommandPalette.Page id="root">
        {filteredItems.length ? (
          filteredItems.map((list) => (
            <CommandPalette.List key={list.id} heading={list.heading}>
              {list.items.map(({ id, children, ...rest }) => (
                <CommandPalette.ListItem
                  key={id}
                  index={getItemIndex(filteredItems, id)}
                  {...rest}
                >
                  {children}
                </CommandPalette.ListItem>
              ))}
            </CommandPalette.List>
          ))
        ) : (
          <CommandPalette.FreeSearchAction />
        )}
      </CommandPalette.Page>
      <CommandPalette.Page id="projects">
        {/* Projects page */}
        <div></div> {/* Adicionando children vazio */}
      </CommandPalette.Page>
    </CommandPalette>
  );
};

export default CommandPallete;  
