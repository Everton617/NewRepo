import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';


type ItemsType = {
  id: UniqueIdentifier;
  pedido: string;
  horario: string;
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
  onDelete: (id: UniqueIdentifier) => void;
};

const Items = ({
  id,
  pedido,
  horario,
  entregador,
  quantidade,
  instrucoes,
  onDelete,
}: ItemsType) => {
  const { t } = useTranslation('common');

  const deletarPedido = () => {
    onDelete(id);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'item',
    },
  });




  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'px-2 py-4 bg-white shadow-md rounded-xl w-full border border-transparent hover:border-gray-200 cursor-pointer',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-center justify-between relative">
        <div className="flex flex-col" {...listeners}>
          <div className="h-20 w-100">
            <div className='font-bold'>{t('Id do Pedido')}:</div> {id}
          </div>
          <div className="h-12">
            <div className='font-bold'>{t('Pedido')}:</div> {pedido}
          </div>
          <div className="h-10">
            <div className='font-bold'>{t('Quantidade')}:</div> {quantidade}
          </div>
          <div className="h-10">
            <div className='font-bold'>{t('Horário')}:</div> {horario}
          </div>
          <div className="h-10">
            <div className='font-bold'>{t('Entregador')}:</div> {entregador}
          </div>

          <div className="h-10">
            <div className='font-bold'>{t('Instruções')}: </div>{instrucoes}
          </div>

        </div>
        <div
          className="absolute top-50 right-2 max-w-5 max-h-5 min-w-5 min-h-5 text-red-500 rounded hover:text-black"
          onClick={deletarPedido}
        >
          <TrashIcon className="w-full h-full" />
        </div>

      </div>
    </div>
  );
};

export default Items;
