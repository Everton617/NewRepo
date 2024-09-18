import { FC } from "react";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from "@dnd-kit/sortable";
import { useTranslation } from 'next-i18next';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { Button } from "../ui/button";
import { IoTrashSharp } from "react-icons/io5";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { TbListSearch } from "react-icons/tb";
import { TbListCheck } from "react-icons/tb";


export type CardType = {
  index: number;
  id: UniqueIdentifier;
  pedido: string
  createdAt: string;
  entregador: string;
  rua: string;
  numero: string;
  complemento: string;
  cep: string;
  cidade: string;
  estado: string;
  tel: string;
  quantidade: number;
  metodo_pag: string;
  instrucoes: string;
  onDelete: (id) => void;
};

const Card: FC<CardType> = ({ id,
  pedido,
  createdAt,
  entregador,
  rua,
  numero,
  complemento,
  cep,
  cidade,
  estado,
  tel,
  metodo_pag,
  quantidade,
  instrucoes,
  onDelete
}) => {
  // useSortableに指定するidは一意になるよう設定する必要があります。s
  const { t } = useTranslation('common');
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: id
  });


  const style = {
    margin: "10px",
    width: "300px",
    opacity: 1,
    color: "#333",
    background: "white",
    padding: "20px",
    transform: CSS.Transform.toString(transform)
  };

  const formattedDate = format(new Date(createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: ptBR });
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

  };



  return (
    // attributes、listenersはDOMイベントを検知するために利用します。
    // listenersを任意の領域に付与することで、ドラッグするためのハンドルを作ることもできます。
    <div className={`flex items-center`}>
      <div ref={setNodeRef} {...attributes} {...listeners} style={style} >
        <div className="flex flex-col" {...listeners}>
          <div className="h-18">
            <div className='font-bold'>{t('Id do Pedido')}:</div> {id}
          </div>
          <div className="h-14">
            <div className='font-bold'>{t('Pedido')}:</div> {pedido}
          </div>
          <div className="h-14">
            <div className='font-bold'>{t('Quantidade')}:</div> {quantidade}
          </div>
          <div className="h-14">
            <div className='font-bold'>{t('Horário')}:</div> {formattedDate}
          </div>
          <div className="h-14">
            <div className='font-bold'>{t('Entregador')}:</div> {entregador}
          </div>
          <div className="h-10">
            <div className='font-bold'>{t('Instruções')}: </div>{instrucoes}
          </div>
        </div>
      </div>
      <div>
        <div onClick={handleClick} className="pr-2">
          <AlertDialog>
            <AlertDialogTrigger>
              <Button className="w-[35px] text-center bg-white border border-black-100 text-red-400 hover:bg-red-400 hover:text-white">
                <IoTrashSharp className="min-w-[20px]" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('Deseja excluir este pedido?')}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('Cancelar')}</AlertDialogCancel>
                <AlertDialogAction className="bg-red-400 hover:bg-white hover:text-red-400 hover:border-red-400 hover:border" onClick={() => onDelete(id)}>{t('Confirmar')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div>
          <Drawer>
            <DrawerTrigger>
              <Button className="w-[35px] text-center bg-white border border-black-100 text-red-400 hover:bg-red-400 hover:text-white">
                <TbListSearch className="min-w-[40px] min-h-[20px]" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-xl pb-8 flex items-center gap-2">
                  {t('Informações do pedido')}
                  <div>
                    <TbListCheck className="min-w-[30px] min-h-[35px]"/>
                  </div></DrawerTitle>
                <DrawerDescription>
                  <div className="flex flex-row gap-12 pl-4" {...listeners}>
                    <div>
                      <div className="h-18 text-[15px]">
                        <div className='font-bold text-lg'>{t('Id do Pedido')}:</div> {id}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Pedido')}:</div> {pedido}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Quantidade')}:</div> {quantidade}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('CEP')}:</div> {cep}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Rua')}:</div> {rua}
                      </div>
                    </div>
                    <div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Cidade')}:</div> {cidade}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Estado')}:</div> {estado}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Número')}:</div> {numero}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Complemento')}:</div> {complemento}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('tel')}:</div> {tel}
                      </div>
                    </div>
                    <div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Forma de Pagamento')}:</div> {metodo_pag}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Horário')}:</div> {formattedDate}
                      </div>
                      <div className="h-14 text-[15px]">
                        <div className='font-bold text-lg'>{t('Entregador')}:</div> {entregador}
                      </div>
                      <div className="h-10 text-[15px]">
                        <div className='font-bold text-lg'>{t('Instruções')}: </div>{instrucoes}
                      </div>
                    </div>
                  </div>
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>

                <DrawerClose>
                  <Button variant="outline">{t('Cancelar')}</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
};

export default Card;