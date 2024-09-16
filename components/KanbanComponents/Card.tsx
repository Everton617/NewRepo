import { FC } from "react";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from "@dnd-kit/sortable";
import { useTranslation } from 'next-i18next';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

export type CardType = {
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

};

const Card: FC<CardType> = ({ id,
  pedido,
  createdAt,
  entregador,
  quantidade,
  instrucoes,
}) => {
  // useSortableに指定するidは一意になるよう設定する必要があります。s
  const { t } = useTranslation('common');
  const { attributes, listeners, setNodeRef, transform } = useSortable({

    id: id
  });

  const style = {
    margin: "10px",
    opacity: 1,
    color: "#333",
    background: "white",
    padding: "10px",
    transform: CSS.Transform.toString(transform)
  };

  const formattedDate = format(new Date(createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: ptBR });

  return (
    // attributes、listenersはDOMイベントを検知するために利用します。
    // listenersを任意の領域に付与することで、ドラッグするためのハンドルを作ることもできます。
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <div className="flex flex-col" {...listeners}>
        <div className="h-18">
          <div className='font-bold'>{t('Id do Pedidooo')}:</div> {id}
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
  );
};

export default Card;
