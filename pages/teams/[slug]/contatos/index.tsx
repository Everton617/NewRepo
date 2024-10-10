import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/contatos/data-table";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/solid"
import { newContactSchema } from '@/lib/zod/teamContact.schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"



import { FaTags, FaTrashCan } from "react-icons/fa6";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { FaUserTag } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";




import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';


import EmojiPicker from 'emoji-picker-react';

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { useTranslation } from 'next-i18next';
import toast from "react-hot-toast";



type label = {
  id: string;
  label: {
    id: string
    name: string
    emoji: string
  }
};


export type Contato = {
  id: string;
  name: string;
  cep: string;
  address: string;
  cidade: string;
  estado: string;
  DDD: string;
  country: string;
  phone: string;
  wpp: string;
  obs: string;
  emp_nome: string;
  cnpj: string;
  emp_cidade: string;
  emp_address: string;
  emp_estado: string;
  emp_country: string;
  emp_DDD: string;
  emp_phone: string;
  ContactLabel: label[];
};




export type onlyLabels = {
  id: string;
  name: string
  emoji: string
}


export default function Contatos() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;



  const [etiquetas, setEtiquetas] = useState<onlyLabels[]>([

  ]);


  const [contacts, setContacts] = useState<Contato[]>([
  ]);


  /* const evoData = [
     { id: "0", name: `Fabrício`, label: "active", phone: "(84) 98752-2972" },
     { id: "1", name: `Márcio`, label: "active", phone: "(84) 98752-2972" },
     { id: "2", name: `Nobrega`, label: "active", phone: "(84) 98752-2972" },
     { id: "3", name: `Fabrício Segundo`, label: "active", phone: "(84) 98752-2972" },
   ];
 */

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();


  const [selectedEmoji, setSelectedEmoji] = useState('');

  const [selectedContact, setSelectedContact] = useState<Contato | null>(null);


  const [selectedLabelId, setSelectedLabelId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);


  async function fetchContatos(slug) {

    try {
      const response = await fetch(`/api/teams/${slug}/contacts?withLabels=true`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  const fetchLabels = async () => {
    try {
      const response = await fetch(`/api/teams/${slug}/labels`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      }); // atualize a URL conforme necessário  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setEtiquetas(data.labels);
    } catch (error) {
      console.error('Erro ao buscar etiquetas:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchContatos(slug);
      if (data) {
        console.log('Contatos carregados', data);
        setContacts(data.contacts);
      } else {
        console.log('Contatos não foram carregados');
      }
    };
    if (slug) {
      fetchLabels();
      fetchData();
    }
  }, [slug]);

  const deleteLabel = async (contactLabelId) => {
    try {
      const response = await fetch(`/api/teams/${slug}/contactLabels`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactLabelId }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error('Erro ao tentar excluir etiqueta')
        throw new Error(data.error || 'Something went wrong');
      }
      toast.success('Etiqueta Excluída com sucesso!')
    } catch (error) {
      ;
    }
  };

  const columns: ColumnDef<Contato>[] = [

    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {

        const contato = row.original || {} as Contato;





        return (
          <div className="flex gap-2 cursor-pointer hover:underline">
            <HoverCard>
              <HoverCardTrigger className="text-[16px]">{contato.name}</HoverCardTrigger>
              <HoverCardContent>
                <div>
                  <strong>{contato.name}</strong>
                  <br />
                  {contato.phone}
                </div>
                <div className="font-bold pt-2">{t('Etiquetas:')}</div>
                <div className="pt-2 grid grid-cols-2 " style={{ width: '70px', flexWrap: 'wrap' }}>
                  {contato.ContactLabel?.map((label, index) => (
                    <Badge key={index} className="rounded-md text-white bg-white hover:bg-red-500 border border-b-4 border-red-400 cursor-pointer   flex justify-center flex-row m-1">
                      <div title={label.label.name}>{label.label.emoji}</div>

                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      }
    },

    {
      accessorKey: "etiquetas",
      header: "Etiquetas",
      cell: ({ row }) => {
        const etiquetas = row.original.ContactLabel || [];
        return (
          <div className="flex gap-2">
            {etiquetas.map((etiqueta, index) => (
              <Badge
                title={etiqueta.label.name}
                key={index}
                className="rounded-md text-white bg-white hover:bg-red-500 border border-b-4 border-red-400 cursor-pointer  "
              >
                <Popover>
                  <PopoverTrigger className="text-[16px]">{etiqueta.label.emoji}</PopoverTrigger>
                  <PopoverContent>
                    <p>{t('Deseja excluir esta etiqueta ?')}</p>
                    <div className="flex justify-evenly items-center pt-2">
                      <Button
                        className="bg-red-400 dark:bg-red-400 hover:bg-red-500 dark:hover:bg-red-500 text-white dark:text-white h-[25px]"
                        onClick={() => deleteLabel(etiqueta.id)}
                      >
                        {t('Confirmar')}
                      </Button>

                    </div>
                  </PopoverContent>
                </Popover>
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "phone",
      header: "Telefone",
    },
    {
      accessorKey: "actions",
      header: "Ações",
      cell: ({ row }) => {




        const contato = row.original;




        const deleteContact = async (id: string) => {
          try {
            const response = await fetch(`/api/teams/${slug}/contacts/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
              // Supondo que `contacts` e `setContacts` estejam disponíveis no escopo  
              const updatedContacts = contacts.filter((contact) => contact.id !== id);
              setContacts(updatedContacts);
              toast.success('Contato excluído com sucesso!');
            } else {
              const errorData = await response.json();
              toast.error(`Erro ao excluir contato: ${errorData.message}`);
            }
          } catch (error) {
            toast.error('Erro ao excluir contato.');
          }
        };


        const handleAddLabel = async (e) => {
          e.preventDefault();
          if (!selectedLabelId) {
            console.error('Nenhuma etiqueta selecionada');
            return;
          }

          try {
            const response = await fetch(`/api/teams/${slug}/contactLabels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                labelId: selectedLabelId,
                contactId: contato.id,
              }),
            });

            if (!response.ok) {
              throw new Error('Erro ao adicionar etiqueta');

            }

            const data = await response.json();
            console.log(data.message);
            toast.success('Etiqueta Criada com sucesso!')
          } catch (error) {
            console.error('Erro:', error);
          }
        };


        const onUpdate = async (data) => {
          try {
            // Enviar solicitação PUT para o servidor  
            const response = await fetch(`/api/teams/${slug}/contacts/${selectedContact?.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ contact: data }),
            });

            if (!response.ok) {
              throw new Error('Erro ao atualizar o contato');
            }

            const updatedContacts = contacts.map((field) =>
              field.name === data.name
                ? {
                  ...field,
                  name: data.name,
                  cep: data.cep,
                  endereco: data.endereco,
                  cidade: data.cidade,
                  estado: data.estado,
                  pais: data.pais,
                  phone: data.phone,
                  whatsapp: data.whatsapp,
                  observacao: data.observacao,
                  cnpj: data.cnpj,
                  empEndereco: data.empEndereco,
                  empCidade: data.empCidade,
                  empEstado: data.empEstado,
                  empPais: data.empPais,
                  empTelefone: data.empTelefone,
                }
                : field
            );



            setContacts(updatedContacts);
            reset();
            toast.success('Contato atualizado com sucesso!');
          } catch (error) {
            toast.error('Erro ao atualizar o contato');
          }
        };


        const handleUpdateClick = (contact) => {
          setSelectedContact(contact);
         
        };


        return (
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <button naria-label="Delete">
                  <TrashIcon className="h-5 w-5 text-red-600" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <h2>{t('Excluir contato')}</h2>
                </DialogHeader>
                <p>{t('Deseja excluir este Contato?')}</p>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">
                      {t('Cancelar')}
                    </Button>
                  </DialogClose>
                  <Button variant="destructive"
                    onClick={() => deleteContact(contato.id)}>
                    {t('Excluir')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVerticalIcon className="h-5 w-5 text-red-400 dark:text-white" />
              </DropdownMenuTrigger >

              <DropdownMenuContent className="flex flex-col ">

                <Sheet >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-red-400 text-white"
                      onClick={() => handleUpdateClick(contato)}
                    >
                      <div className="flex items-center justify-center h-5 w-6 text-white">
                        <ArrowPathIcon className="h-5 w-5" />
                      </div>
                      {t('Atualizar Contato')}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="pt-6">
                    <SheetHeader>
                      <SheetTitle>{t('Atualize o contato')}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit(onUpdate)} className="pt-2">
                      <div className=" flex flex-col ">
                        <div className="flex flex-col space-y-2.5" style={{ width: "360px" }}>
                          <div className="flex flex-row items-center gap-2 justify-between">
                            <div>
                              <Label htmlFor="name">{t('Insira o nome do contato')}</Label>
                              <Input
                                id="name"
                                placeholder="Digite o seu nome:"
                                defaultValue={selectedContact?.name || ''}
                                className=""
                                {...register('name', { required: 'Nome é obrigatório' })}
                              />
                              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                            </div>
                            <div>
                              <Label htmlFor="phone">{t('Insira o número ')}</Label>
                              <Input
                                id="phone"
                                placeholder="Digite o telefone:"
                                defaultValue={selectedContact?.phone || ''}
                                {...register('phone')}
                              />
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <div>
                              <Label htmlFor="cep">{t('Insira o cep')}</Label>
                              <Input
                                placeholder="Cep:"
                                id="cep"
                                {...register('cep')}
                                defaultValue={selectedContact?.cep || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">{t('Insira o endereço')}</Label>
                              <Input
                                placeholder="Endereço:"
                                id="address"
                                {...register('address')}
                                defaultValue={selectedContact?.address || ''}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div>
                              <Label htmlFor="color" >{t('Insira a Cidade')}</Label>
                              <Input
                                placeholder="Cidade:"
                                className=""
                                id="cidade"
                                defaultValue={selectedContact?.cidade || ''}
                                {...register('cidade')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">{t('Insira o Estado')}</Label>
                              <Input
                                id="estado"
                                placeholder="Estado:"
                                className=""
                                defaultValue={selectedContact?.estado || ''}
                                {...register('estado')}
                              />
                            </div>
                          </div>
                          <div className="flex flex-row gap-2">
                            <div>
                              <Label htmlFor="pais">{t('Insira o País')}</Label>
                              <Input
                                id="country"
                                placeholder="Digite o seu País:"
                                defaultValue={selectedContact?.country || ''}
                                {...register('country')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="whatsapp">{t('Insira o Whatsapp')}</Label>
                              <Input
                                id="wpp"
                                placeholder="Digite o seu Whatsapp:"
                                {...register('wpp')}
                                defaultValue={selectedContact?.wpp || ''}
                              />
                            </div>
                          </div>
                        </div>
                        <SheetTitle className="pt-8 pb-4">{t('Informações da Empresa')}</SheetTitle>
                        <div className="flex flex-col gap-2">
                          <div className="flex w-full pr-8">
                            <div className="w-full">
                              <Label htmlFor="emp_nome">{t('Insira o nome da Empresa')}</Label>
                              <Input
                                id="emp_nome"
                                placeholder="Nome da emresa"
                                defaultValue={selectedContact?.emp_nome || ''}
                                {...register('emp_nome')}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div>
                              <Label htmlFor="cnpj">{t('CNPJ da empresa')}</Label>
                              <Input
                                id="cnpj"
                                placeholder="CNPJ "
                                defaultValue={selectedContact?.cnpj || ''}
                                {...register('cnpj')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="emp_address">{t('Endereço da empresa')}</Label>
                              <Input
                                id="emp_address"
                                placeholder="Endereço"
                                defaultValue={selectedContact?.emp_address || ''}
                                {...register('emp_address')}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div>
                              <Label htmlFor="emp_cidade">{t('Cidade da empresa')}</Label>
                              <Input
                                id="emp_cidade"
                                placeholder="Cidade"
                                defaultValue={selectedContact?.emp_cidade || ''}
                                {...register('emp_cidade')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">{t('Estado da empresa')}</Label>
                              <Input
                                id="emp_estado"
                                placeholder="Estado"
                                defaultValue={selectedContact?.emp_estado || ''}
                                {...register('emp_estado')}
                              />
                            </div>
                          </div>
                          <div className="flex flex-row gap-2">
                            <div>
                              <Label htmlFor="color">{t('País da Empresa')}</Label>
                              <Input
                                id="emp_country"
                                placeholder="País:"
                                defaultValue={selectedContact?.emp_country || ''}
                                {...register('emp_country')}
                              />
                            </div>
                            <div>
                              <Label htmlFor="color">{t('Telefone da Empresa')}</Label>
                              <Input
                                id="emp_phone"
                                placeholder="Telefone"
                                defaultValue={selectedContact?.emp_phone || ''}
                                {...register('emp_phone')}
                              />
                            </div>
                          </div>
                          <Textarea
                            id="obs"
                            {...register('obs')}
                            defaultValue={selectedContact?.obs || ''}
                            placeholder="Caso haja, digite alguma informação" />

                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          type="submit"
                          className="bg-red-400 hover:bg-red-500 text-white dark:text-white rounded-lg p-2 dark:bg-red-400 dark:hover:bg-red-500 ">{t('Atualizar Contato')}</Button>
                      </div>
                    </form>
                   
                  </SheetContent>
                </Sheet>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="bg-red-400 text-white hover:bg-white hover:border hover:border-red-400 hover:text-red-400" variant="outline">{t('Adicionar Etiqueta')}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <form className="flex gap-2" onSubmit={handleAddLabel}>
                      <Select onValueChange={(value) => setSelectedLabelId(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('Etiquetas')} />
                        </SelectTrigger>
                        <SelectContent>
                          {etiquetas.map((etiqueta) => (
                            <SelectItem key={etiqueta.id} value={etiqueta.id}>
                              <div className="flex flex-row items-center">
                                <span className="pr-2">{etiqueta.emoji}</span>
                                <span>{etiqueta.name}</span>

                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button type="submit" className="w-[90px] dark:bg-red-400 dark:text-white">
                        {t('Adicionar')}
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>


              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    },
  ]


  //const [evoContacts, setEvoContacts] = useState(evoData);
  const onSubmit = async (data) => {
    // Validar dados contra o schema  
    try {
      newContactSchema.parse(data);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      toast.error('Dados inválidos. Verifique os campos e tente novamente.');
      return;
    }

    // Criar o novo contato  
    const newContact = {
      name: data.name,
      cep: data.cep,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      pais: data.pais,
      phone: data.phone,
      whatsapp: data.whatsapp,

      observacao: data.observacao,
      cnpj: data.cnpj,
      empEndereco: data.empEndereco,
      empCidade: data.empCidade,
      empEstado: data.empEstado,
      empPais: data.empPais,
      empTelefone: data.empTelefone
    };

    const selectedEtiqueta = etiquetas.find(etiqueta => etiqueta.id === selectedLabelId);
    const newEtiqueta = selectedEtiqueta ? [{ labelId: selectedEtiqueta.id }] : [];



    console.log('Criando', newContact, newEtiqueta)

    try {
      const response = await fetch(`/api/teams/${slug}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: newContact, labels: newEtiqueta })
      });

      const responseData = await response.json();

      if (response.ok) {
        setContacts((prevContacts) => [...prevContacts, responseData.newContact]);
        reset();
        toast.success('Contato adicionado com sucesso!');
      } else {
        // Exibir mensagem de erro no console  
        console.error('Erro ao adicionar contato:', responseData.message || 'Erro desconhecido');
        toast.error('Erro ao adicionar contato: ' + (responseData.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
      toast.error('Erro ao adicionar contato');
    }
  };


  const onAddTag = async (data: any) => {
    console.log('adicionado');

    if (!selectedEmoji) {
      
      toast.error('Escolha um emoji'); 
      return;
    }

    const newEtiqueta: onlyLabels = {
      id: '',
      name: data.name,
      emoji: selectedEmoji,
    };

    try {
      const response = await fetch(`/api/teams/${slug}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: newEtiqueta }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar etiqueta');
      }

      const result = await response.json();
      
      setEtiquetas([...etiquetas, result.label]);
      toast.success('Etiqueta Criada!')
    } catch (error) {
      console.error('Erro ao adicionar etiqueta:', error);
    }

    reset(); // Reset form after submission  
  };

  const onEmojiClick = (event: any) => {
    console.log(event.emoji);

    setSelectedEmoji(event.emoji);
    setValue('emoji', event.emoji);
  };

  const handleDeleteLabels = async (id) => {
    try {
      const response = await fetch(`/api/teams/${slug}/labels/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        // Remove the deleted label from the state  
        setEtiquetas(etiquetas.filter(etiqueta => etiqueta.id !== id));
        console.log(result.message);
        toast.success('Etiqueta Excluída com sucesso !')
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('An error occurred while deleting the label:', error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    // Verifica se o nome do contato inclui o termo de busca  
    const nameMatches = contact.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Verifica se a etiqueta selecionada é nula ou se o contato possui a etiqueta selecionada  
    const labelMatches = selectedLabel === null || contact.ContactLabel.some(label => label.label.id === selectedLabel);

    return nameMatches && labelMatches;


  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };



  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex justify-between gap-3">

        <Input type="text"
          placeholder="Procurar um contato"
          className="w-[20%]"
          value={searchTerm}
          onChange={handleSearchChange} />
        <div className="flex gap-3">

          <Popover>
            <PopoverTrigger
              className="">
              <Button variant="outline" className="flex gap-1 items-center bg-red-400 dark:bg-red-400 hover:text-red-400 hover:border-red-400 text-white">
                <FaTags className="h-4 w-5" />{t('Adicionar Etiqueta')}

              </Button>

            </PopoverTrigger>
            <PopoverContent>
              <h3 className="pl-2">
                {t('Escolha um nome e um emoji')}
              </h3>

              <form onSubmit={handleSubmit(onAddTag)} className="p-2">
                <div className="flex flex-row items-center gap-2 pb-2">
                  <div>
                    <Input
                      id="name"
                      type="text"
                      className="w-[200px]"
                      placeholder="Ex: Top-Vendas"
                      {...register('name', { required: 'Este campo é obrigatório' })}
                    />
                    {errors.name && <span className="text-red-500">{errors.name.message}</span>}
                  </div>
                  <Popover>
                    <PopoverTrigger>

                      {selectedEmoji ? (
                        <span className="h-5 w-5">{selectedEmoji}</span>
                      ) : (
                        <MdOutlineEmojiEmotions className="h-5 w-5" />
                      )}
                    </PopoverTrigger>
                    <PopoverContent
                      className=""
                      style={{ position: 'relative', right: '90px' }}
                    >
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit"
                  className="bg-red-400 dark:bg-red-400 dark:text-white text-white rounded-md w-[100px] p-">
                  {t('Salvar')}
                </Button>

              </form>

            </PopoverContent>
          </Popover>



          <DropdownMenu>
            <DropdownMenuTrigger className="">
              <Button variant="outline"
                className="flex gap-1 items-center bg-red-400 dark:bg-red-400 hover:border hover:border-red-400 hover:text-red-400 text-white">
                <DropdownMenuLabel className="">
                  {selectedLabel ? (
                    etiquetas.find(etiqueta => etiqueta.id === selectedLabel)?.emoji
                  ) : (
                    <div className="flex flex-row gap-2">
                      <div>
                        <FaUserTag className=" h-5 w-5"/>
                      </div>
                      <div className="flex items-center gap-1">
                        {t('Etiquetas')} <IoIosArrowDown />
                      </div>
                    </div>
                  )}
                </DropdownMenuLabel>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent >
              <DropdownMenuLabel>
                {t('Selecione uma Etiqueta')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
              className=" max-h-[150px] overflow-y-auto"
                value={selectedLabel ?? ''}
                onValueChange={value => setSelectedLabel(prevSelectedLabel => prevSelectedLabel === value ? null : value)}
              >
                {etiquetas.map((etiqueta, index) => (
                  <DropdownMenuRadioItem value={etiqueta.id} key={index} className="flex flex-row w-[200px] ">
                    <div className=" h-[22px] w-[200px] flex items-center justify-around ">
                      <div title={etiqueta.name} className="w-[35px] text-[16px] rounded-md text-white bg-white hover:bg-red-500 border border-b-4 border-red-400 cursor-pointer   flex justify-center flex-row m-1">
                        {etiqueta.emoji}
                      </div>
                      <div className="cursor-pointer">
                        <FaTrashCan
                          className="h-4 w-4"
                          onClick={() => {
                            handleDeleteLabels(etiqueta.id);
                          }}
                        />
                        
                      </div>
                    </div>
                  </DropdownMenuRadioItem>

                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>








          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-red-400 dark:bg-red-400 dark:hover:bg-white hover:border hover:border-red-400 text-white hover:text-red-400">

                <PlusIcon className="h-5 w-5" />

                {t('Adicionar Contato')}
              </Button>
            </SheetTrigger>
            <SheetContent className="pt-6 min-w-[400px]">
              <SheetHeader>
                <SheetTitle className="pb-2">{t('Adicione um Novo Contato')}</SheetTitle>

              </SheetHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="pt-2">
                <div className=" flex flex-col ">
                  <div className="flex flex-col space-y-2.5" style={{ width: "360px" }}>


                    <div className="flex flex-row items-center gap-2 justify-between">

                      <div>
                        <Label htmlFor="name">{t('Insira o nome do contato')}</Label>
                        <Input
                          id="name"
                          placeholder="Digite o seu nome:"
                          className=""
                          {...register('name', { required: 'Nome é obrigatório' })}
                        />
                        {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}

                      </div>
                      <div>
                        <Label htmlFor="phone">{t('Insira o número ')}</Label>
                        <Input
                          id="phone"
                          placeholder="Digite o telefone:"
                          {...register('phone')}
                        />
                      </div>

                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div>
                        <Label htmlFor="cep">{t('Insira o cep')}</Label>
                        <Input
                          placeholder="Cep:"
                          id="cep"
                          {...register('cep')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">{t('Insira o endereço')}</Label>
                        <Input
                          placeholder="Endereço:"
                          id="address"
                          {...register('address')}
                        />
                      </div>


                    </div>

                    <div className="flex gap-2">

                      <div>
                        <Label htmlFor="color" >{t('Insira a Cidade')}</Label>
                        <Input
                          placeholder="Cidade:"
                          className=""
                          id="cidade"
                          {...register('cidade')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">{t('Insira o Estado')}</Label>
                        <Input
                          id="estado"
                          placeholder="Estado:"
                          className=""
                          {...register('estado')}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2">
                      <div>
                        <Label htmlFor="pais">{t('Insira o País')}</Label>
                        <Input
                          id="country"
                          placeholder="Digite o seu País:"
                          {...register('country')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp">{t('Insira o Whatsapp')}</Label>
                        <Input
                          id="wpp"
                          placeholder="Digite o seu Whatsapp:"
                          {...register('wpp')}
                        />
                      </div>
                    </div>

                  </div>


                  <SheetTitle className="pt-8 pb-4">{t('Informações da Empresa')}</SheetTitle>
                  <div className="flex flex-col gap-2">
                    <div className="flex w-full pr-8">
                      <div className="w-full">
                        <Label htmlFor="emp_nome">{t('Insira o nome da Empresa')}</Label>
                        <Input
                          id="emp_nome"
                          placeholder="Nome da emresa"
                          {...register('emp_nome')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label htmlFor="cnpj">{t('CNPJ da empresa')}</Label>
                        <Input
                          id="cnpj"
                          placeholder="CNPJ "
                          {...register('cnpj')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emp_address">{t('Endereço da empresa')}</Label>
                        <Input
                          id="emp_address"
                          placeholder="Endereço"
                          {...register('emp_address')}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">

                      <div>
                        <Label htmlFor="emp_cidade">{t('Cidade da empresa')}</Label>
                        <Input
                          id="emp_cidade"
                          placeholder="Cidade"
                          {...register('emp_cidade')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="color">{t('Estado da empresa')}</Label>
                        <Input
                          id="emp_estado"
                          placeholder="Estado"
                          {...register('emp_estado')}
                        />
                      </div>

                    </div>
                    <div className="flex flex-row gap-2">
                      <div>
                        <Label htmlFor="color">{t('País da Empresa')}</Label>
                        <Input
                          id="emp_country"
                          placeholder="País:"
                          {...register('emp_country')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">{t('Telefone da Empresa')}</Label>
                        <Input
                          id="emp_phone"
                          placeholder="Telefone"
                          {...register('emp_phone')}
                        />
                      </div>
                    </div>

                    <Textarea
                      id="obs"
                      {...register('obs')}
                      placeholder="Caso haja, digite alguma informação" />



                    <div className="flex items-center gap-2">

                      <Select onValueChange={(value) => setSelectedLabelId(value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t('Etiquetas')} />
                        </SelectTrigger>
                        <SelectContent>
                          {etiquetas.map((etiqueta) => (
                            <SelectItem key={etiqueta.id} value={etiqueta.id}>
                              <div className="flex flex-row items-center">
                                <span className="pr-2">{etiqueta.emoji}</span>
                                <span>{etiqueta.name}</span>

                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                    </div>

                  </div>

                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    className="bg-red-400 hover:bg-white hover:border hover:border-red-400 text-white hover:text-red-400 dark:text-white rounded-lg p-2 dark:bg-red-400 dark:hover:bg-white ">{t('Adicionar Contato')}</Button>
                </div>
              </form>
              <SheetFooter>
                <SheetClose asChild>

                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <DataTable columns={columns} data={filteredContacts} />

    </div>
  );
}