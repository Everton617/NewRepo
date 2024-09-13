import { FC, useState } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Card, { CardType } from "./Card";
import clsx from 'clsx';
import { PencilIcon, PlusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useTranslation } from 'next-i18next';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from '@hookform/resolvers/zod';
import { FormDataSchema } from '@/lib/FormDataSchema';
import { z } from "zod";
import { useForm, SubmitHandler } from 'react-hook-form';

import { useRouter } from 'next/router';
import toast from "react-hot-toast";


type Inputs = z.infer<typeof FormDataSchema>;

export type ColumnType = {
  id: string;
  title: string;
  items: CardType[];
  iconColorClass: string;
  borderColorClass: string;
  buttonColorClass: string;
  onAddItem: (data) => void;
  onClickEdit: () => void;
};

const Column: FC<ColumnType> = ({ id, title, items, onClickEdit, borderColorClass, iconColorClass,buttonColorClass }) => {
  const { setNodeRef } = useDroppable({ id: id });
  const { t } = useTranslation('common');
  const [newTitle, setNewTitle] = useState(title);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
 
  const router = useRouter();
  const { slug } = router.query;

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  });

  const processForm: SubmitHandler<Inputs> = data => {
    console.log(data);
    reset();
    onAddItem(data);
    setShowAddItemModal(false);
  };

  const handleCEPChange = async (event) => {
    const cep = event.target.value;
    setValue('cep', cep);
    const cepFormatado = cep.replace("-", "");
    if (cepFormatado.length > 8) {
      toast.error('O cep deve ter no máximo 8 caracteres');
    } else if (cepFormatado.length < 8) {
      setValue('rua', '');
      setValue('cidade', '');
      setValue('estado', '');
    }
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);
      const data = await response.json();
      if (!response.ok || data.erro) {
        toast.error('Cep Inexistente');
        throw new Error('Erro ao buscar dados do CEP');
      }
      setValue('rua', data.logradouro || '');
      setValue('cidade', data.localidade || '');
      setValue('estado', data.uf || '');
    } catch (error) {
      // setEndereco({}); 
    }
  };

  const onAddItem = async (data: Inputs) => {
    console.log('Adding item:', data);
    const { pedido,
      quantidade,
      entregador,
      numero,
      complemento,
      cep,
      tel,
      metodo_pag,
      instrucoes 
    } = data;
    const cepFormatado = cep.replace("-", "");

    const validarCep = async (cep) => {
      const url = `https://viacep.com.br/ws/${cep}/json/`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Erro ao validar o CEP');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erro:', error);
        return null;
      }
    };

    const cepDados = await validarCep(cepFormatado);
    if (!cepDados) {
      console.error('CEP inválido');
      return;
    }

    console.log('Container title:', title);
    const order = {
      pedido,
      quantidade,
      status: title,
      entregador,
      numero,
      complemento,
      cep,
      tel,
      metodo_pag,
      instrucoes,
    };


    try {
      const response = await fetch(`/api/teams/${slug}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await response.json();
      console.log("response ==> ", data);
    } catch (error) {
      console.error("error ==> ", error);
    }
    toast.success('Pedido adicionado com sucesso!')
  };


  const showItemModal = () => {
    setShowAddItemModal(true);
  };

  const handleChangeTitle = () => {
    if (newTitle !== title) {
      onClickEdit();
      console.log(`Título alterado para: ${newTitle}`);
    }
  };

  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`${borderColorClass} ${iconColorClass}`}
        style={{
          width: "400px",
          background: "rgba(245,247,249,1.00)",
          marginRight: "10px",
          borderRadius: "10px"
        }}
      >
        <div className="flex justify-between items-center p-2">
          <PlusIcon className={clsx('w-5 h-5 cursor-pointer', iconColorClass)} onClick={showItemModal} />
          <p
            style={{
              padding: "5px 20px",
              textAlign: "left",
              fontWeight: "500",
              color: "#575757",
            }}
          >
            {title}
          </p>
          <Popover>
            <PopoverTrigger><PencilIcon className={clsx('w-5 h-5', iconColorClass)} /></PopoverTrigger>
            <PopoverContent>
              <div className={`flex flex-col bg-gray-100 text-white w-[220px] p-4 gap-4 rounded-md ${borderColorClass}`}>
                <div>
                  <h2 className="text-black">
                    {t('Deseja Alterar este título?')} &quot;{title}&quot;
                  </h2>
                </div>
                <div className="flex gap-4 flex-col">
                  <Input
                    id=""
                    placeholder="Digite um nome"
                    className="col-span-2 h-6 w-[180px] text-black"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Button
                    className={`w-[80px] hover:bg-red-500 ${buttonColorClass}`}
                    onClick={handleChangeTitle}
                  >
                    {t('Alterar')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {items.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            pedido={card.pedido}
            createdAt={card.createdAt}
            entregador={card.entregador}
            rua={card.rua}
            numero={card.numero}
            complemento={card.complemento}
            cep={card.cep}
            cidade={card.cidade}
            estado={card.estado}
            tel={card.tel}
            quantidade={card.quantidade}
            metodo_pag={card.metodo_pag}
            instrucoes={card.instrucoes}
          />
        ))}
      </div>
      {showAddItemModal && (
        <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
          <DialogContent className="min-w-[700px]">
            <div><DialogTitle className="text-xl font-bold">{t('Adicione um novo Pedido')}</DialogTitle></div>
            <form onSubmit={handleSubmit(processForm)}
              className='flex flex-1 flex-col gap-4 w-full'>

              <div className="flex flex-col w-full items-start gap-y-5 overflow-auto max-h-[700px] pb-10">




                <div className="grid grid-cols-2 gap-4 ">

                  <div className="space-y-2 pl-8 ">
                    <label className='text-black '>{t('Produtos: ')}</label>
                    <input
                      placeholder='Insira os produtos do pedidooo'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60 '
                      {...register('pedido')}
                    />
                    {errors.pedido?.message && (
                      <p className='text-sm text-red-400'>{errors.pedido.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pl-7 ">
                    <label className='text-black'>{t('Quantidade: ')}</label>
                    <input
                      placeholder='Insira a quantidade'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl'
                      {...register('quantidade')}
                    />
                    {errors.quantidade?.message && (
                      <p className='text-sm text-red-400'>{errors.quantidade.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 pl-7">
                    <label className='text-black block '>{t('CEP: ')}</label>
                    <input
                      placeholder='Insira o cep do destinatário'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                      {...register('cep', { required: 'O CEP é obrigatório.' })}
                      onChange={handleCEPChange} // Adiciona o evento onChange para buscar dados do CEP
                    />
                    {errors.cep?.message && (
                      <p className='text-sm text-red-400'>{errors.cep.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 pl-7 ">
                    <label className='text-black block'>{t('Estado: ')}</label>
                    <input
                      readOnly
                      placeholder='Insira o estado do destinatário'
                      className={`rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl hover:cursor-not-allowed w-50 `}
                      {...register('estado')}
                    />
                    {errors.estado?.message && (
                      <p className='text-sm text-red-400'>{errors.estado.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-0 pl-8">
                    <label className='text-black block'>{t('Cidade: ')}</label>
                    <input
                      readOnly
                      placeholder='Insira a cidade do destinatário'
                      className={`rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl hover:cursor-not-allowed w-60 `}
                      {...register('cidade')}
                    />
                    {errors.cidade?.message && (
                      <p className='text-sm text-red-400'>{errors.cidade.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 pt-1 pl-8 ">
                    <label className='text-black block'>{t('Rua: ')}</label>
                    <input
                      placeholder='Insira a rua do destinatário'
                      readOnly
                      className={`rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl hover:cursor-not-allowed  w-50 `}
                      {...register('rua')}
                    />
                    {errors.rua?.message && (
                      <p className='text-sm text-red-400'>{errors.rua.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pl-7 pt-1">
                    <label className='text-black'>{t('Número: ')}</label>
                    <input
                      placeholder='Insira o número residencial do destinatário'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                      {...register('numero')}
                    />
                    {errors.numero?.message && (
                      <p className='text-sm text-red-400'>{errors.numero.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 pl-8 p-2">
                    <label className='text-black '>{t('Complemento: ')}</label>
                    <input
                      placeholder=''
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-50'
                      {...register('complemento')}
                    />
                    {errors.complemento?.message && (
                      <p className='text-sm text-red-400'>{errors.complemento.message}</p>
                    )}
                  </div>





                  <div className="space-y-2 pl-7 ">
                    <label className='text-black'>{t('Insira o telefone do destinatário: ')}</label>
                    <input
                      placeholder='Insira o telefone do destinatário'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                      {...register('tel')}
                    />
                    {errors.tel?.message && (
                      <p className='text-sm text-red-400'>{errors.tel.message}</p>
                    )}

                  </div>



                  <div className="space-y-2 pl-8">
                    <label className='text-black'>{t('Entregador: ')}</label>
                    <input
                      placeholder='Nome do entregador'
                      className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl'
                      {...register('entregador')}
                    />
                    {errors.entregador?.message && (
                      <p className='text-sm text-red-400'>{errors.entregador.message}</p>
                    )}
                  </div>



                </div>

                <div className='grid grid-cols-1 w-full'>
                  <div className="space-y-2 flex flex-col pl-8 w-full pr-10">
                    <label className='text-black'>{t('Instruções Especiais: ')}</label>
                    <textarea
                      className="textarea textarea-bordered bg-gray-100 text-black "
                      placeholder="Caso exista, informe alguma instrução"
                      {...register('instrucoes')}
                    ></textarea>
                  </div>

                  <div className="space-y-2 pl-8 pt-5">
                    <select
                      className="select w-full max-w-xs bg-gray-100 text-black rounded-lg"
                      {...register('metodo_pag')}
                      defaultValue=""
                    >
                      <option value="" disabled selected>{t('Selecione a forma de pagamento')}</option>
                      <option value={"credito"}>{t('Cartão de Crédito')}</option>
                      <option value={"debito"}>{t('Cartão de Débito')}</option>
                      <option value={"pix"}>{t('PIX')}</option>
                      <option value={"na_entrega"}>{t('Na Entrega')}</option>
                    </select>
                    {errors.metodo_pag?.message && (
                      <p className='text-sm text-red-400'>{errors.metodo_pag.message}</p>
                    )}
                  </div>



                </div>


              </div>

              <div className='p-5 flex justify-end'>
                <Button
                  variant='destructive'
                >
                  {t('Adicionar Pedido')}</Button>
              </div>

            </form>
          </DialogContent>
        </Dialog>
      )}
    </SortableContext>
  );
};

export default Column;  
