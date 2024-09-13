import React from 'react';
import AppShell from '../shared/shell/AppShell';
import { SWRConfig } from 'swr'
import CommandPallete from '@/components/commandPallete';
import { Toaster } from "react-hot-toast";import ChatwootWidget from '../widgets/chatWoot';
;

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <AppShell>{children}</AppShell>
      <ChatwootWidget />
      <Toaster position="top-center" />
      <CommandPallete/>
    </SWRConfig>
  );
}
