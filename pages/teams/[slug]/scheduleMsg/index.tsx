/**
 * v0 by Vercel.
 * @see https://v0.dev/t/LtOgZzNZ4X9
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Contato } from "../contatos"

import { FaceSmileIcon, UserCircleIcon } from "@heroicons/react/24/outline"

import EmojiPicker from 'emoji-picker-react';

import { useTranslation } from 'next-i18next';
import { useState } from "react"
import { DateTimePicker } from "@/components/date-timePicker/date-time-picker"

export default function Component() {
    const { t } = useTranslation('common');

    const [selectedContacts, setSelectedContacts] = useState<Contato[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [message, setMessage] = useState('');
    const [displayMessage, setDisplayMessage] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [messageTime, setMessageTime] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showBalloon, setShowBalloon] = useState(true);

    console.log(displayMessage, isMessageVisible, messageTime);

    /* ADICIONAR SELEÇÃO DE HORA TAMBEM ALEM DO CALENDÁRIO */


    const [contacts, setContacts] = useState<Contato[] | []>([]);

    console.log(setContacts);

    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map(n => n[0]).join('');
        return initials.slice(0, 2).toUpperCase();
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
    );

    const handleContactSelect = (contact: Contato) => {
        setSelectedContacts(prevSelected => {
            console.log('Estado anterior:', prevSelected);
            if (prevSelected.some(c => c.id === contact.id)) {
                const updated = prevSelected.filter(c => c.id !== contact.id);
                console.log('Removido:', contact);
                return updated;
            } else {
                const updated = [...prevSelected, contact];
                console.log('Adicionado:', contact);
                return updated;
            }
        });
    };

    const handleEmojiSelect = (event: any) => {
        
        console.log(event)
        setMessage(prevMessage => prevMessage + event.emoji);
    };

    const handleSendMessage = () => {
        setDisplayMessage(message); // Atualiza o estado para exibir a mensagem
        setMessageTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); // Formata a hora para exibir apenas hora e minutos
        setIsMessageVisible(true);
        setShowBalloon(false)

    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] max-w-6xl mx-auto mt-[100px]  ">
            <div className="flex justify-between  h-[600px] max-w-[700px] pt-20">
                <div className="flex flex-col pr-20">
                    <h1 className="text-2xl font-bold pb-2">{t('Agende uma mensagem:')}</h1>
                    <p className="text-muted-foreground pb-2">{t('Escolha uma data e escreva uma mensagem')}</p>
                    <div>

                        <DateTimePicker
                        />
                    </div>
                </div>


                <div className="grid md:grid-cols-[1fr_300px] ">

                    <div className="">
                        <div className="flex flex-row gap-2 ">
                            <div className="w-[260px]">
                                <Textarea
                                    placeholder="Digite sua mensagem..."
                                    className="h-[120px]"
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        setIsTyping(true);
                                        setShowBalloon(false) // Atualiza o estado para exibir a mensagem de orientação
                                    }}

                                />
                            </div>
                            <div className="flex items-end">
                                <Popover>
                                    <PopoverTrigger className="h-5 w-5"><FaceSmileIcon /></PopoverTrigger>
                                    <PopoverContent><EmojiPicker onEmojiClick={(event) => handleEmojiSelect(event)} /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="pt-10 flex flex-col gap-4">
                            <div>
                                <Label htmlFor="contacts">{t('Selecione um contato:')}</Label>
                                <div className="relative">
                                    <Input
                                        id="contacts"
                                        placeholder="Pesquisar por contato"
                                        className="pr-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center">
                                        <SearchIcon className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        {t('Selecione uma etiqueta')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="p-0 w-full">
                                    <DropdownMenuLabel>{t('Etiquetas:')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarImage src="/placeholder-user.jpg" />
                                                <AvatarFallback>JD</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{t('Pessoal:')}</p>
                                            </div>
                                            <Checkbox id="label-1" />
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarImage src="/placeholder-user.jpg" />
                                                <AvatarFallback>JA</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{t('Trabalho')}</p>
                                            </div>
                                            <Checkbox id="label-2" />
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarImage src="/placeholder-user.jpg" />
                                                <AvatarFallback>SM</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{t('Familía')}</p>
                                            </div>
                                            <Checkbox id="label-3" />
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div style={{ maxHeight: "200px", width: "300px" }}>
                                <div className="h-full overflow-y-auto">
                                    {filteredContacts.map(contact => (
                                        <div
                                            key={contact.id}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleContactSelect(contact)}
                                        >
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{contact.name}</p>
                                                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                            </div>
                                            <Checkbox id={contact.id} checked={selectedContacts.some(c => c.id === contact.id)} />

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button className="bg-red-400" size="lg">{t('Agendar Mensagem')}</Button>
                        </div>
                    </div>

                </div>

            </div>
            <div className="hidden md:block">
                <div className="relative w-full h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[320px] h-[600px] bg-[#111827] rounded-[36px] overflow-hidden border-[6px] border-[#1c1e21]">
                            <div className="h-[80px] bg-[#1c1e21] flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8 bg-white">
                                        <UserCircleIcon className="text-gray-500" />
                                    </Avatar>
                                    <div>
                                        {selectedContacts.length > 0 ? (
                                            <div>
                                                <p className="text-white">{selectedContacts[0].name}</p>

                                                {selectedContacts.length > 1 && (
                                                    <p className="text-white text-sm">{t('e mais')} {selectedContacts.length - 1}</p>
                                                )}

                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#a0a0a0]">{t('Nenhum contato selecionado ainda')}</p>
                                        )}
                                    </div>

                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon">
                                        <PhoneCallIcon className="w-5 h-5 text-white" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <VideoIcon className="w-5 h-5 text-white" />
                                    </Button>
                                </div>
                            </div>
                            <div className="h-[400px] overflow-auto p-4 flex flex-col gap-4">
                                <div className="flex justify-start">
                                    <div className="bg-[#202c33] text-white px-4 py-2 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl max-w-[200px]">
                                        <p>{t('Bom dia!')}</p>
                                        <p className="text-xs text-[#a0a0a0] mt-1">{t('Agendar Mensagem')}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-[#005c4b] text-white px-4 py-2 rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl max-w-[200px]">
                                        <p>{t('Agendar Mensagem')}</p>
                                        <p className="text-xs text-[#a0a0a0] mt-1">{t('Agendar Mensagem')}</p>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-[#202c33] text-white px-4 py-2 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl max-w-[200px]">
                                        <p>{t('Agendar Mensagem')}</p>
                                        <p className="text-xs text-[#a0a0a0] mt-1">{t('Agendar Mensagem')}</p>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    {isTyping && (
                                        <div className="flex justify-end">

                                            <div className="bg-[#005c4b] text-white px-4 py-2 rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl max-w-[200px]">
                                                <Textarea
                                                    placeholder="Digite sua mensagem..."
                                                    className="bg-[#005c4b] border-none focus:outline-none"
                                                    value={message}
                                                    onChange={(e) => {
                                                        setMessage(e.target.value);
                                                        // Atualiza o estado para exibir a mensagem de orientação
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    )}
                                </div>
                                <div className="">
                                    {showBalloon && (
                                        <div className="relative max-w-xs mt-2 animate-float">
                                            <p className="bg-[#005c4b] text-white px-4 py-2 rounded-lg relative z-10 ">
                                                {t('Digite uma mensagem e veja como ela ficará !')}
                                            </p>
                                            <div className="absolute bottom-0 right-4 transform translate-y-full border-solid border-t-[#005c4b] "></div>
                                        </div>
                                    )}
                                </div>


                            </div>
                            <div className="h-[80px] bg-[#1c1e21] flex items-center justify-between px-4 mt-8">
                                <Input
                                    placeholder="Type a message"

                                    className="bg-[#202c33] text-white rounded-full px-4 py-2 flex-1 mr-2"
                                />
                                <Button variant="ghost" size="icon" onClick={handleSendMessage}>
                                    <SendIcon className="w-5 h-5 text-white" />
                                </Button>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}




function PhoneCallIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            <path d="M14.05 2a9 9 0 0 1 8 7.94" />
            <path d="M14.05 6A5 5 0 0 1 18 10" />
        </svg>
    )
}


function PlusIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}


function SearchIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}


function SendIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}


function VideoIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
            <rect x="2" y="6" width="14" height="12" rx="2" />
        </svg>
    )
}

