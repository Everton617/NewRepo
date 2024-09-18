import "../../../../styles/sdk-override.module.css";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Column, { ColumnType } from "@/components/KanbanComponents/Column";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import toast from "react-hot-toast";
import { useTranslation } from 'next-i18next';

const containerColors = [
  'border-t-4 border-red-400',
  'border-t-4 border-sky-500',
  'border-t-4 border-teal-400',
  'border-t-4 border-yellow-400',
];

const iconColors = [
  'text-red-400 hover:text-red-900',
  'text-sky-500 hover:text-sky-900',
  'text-teal-400 hover:text-teal-900',
  'text-yellow-400 hover:text-yellow-900',
];
const buttonColors = [
  'bg-red-400 hover:bg-red-500',
  'bg-sky-500 hover:bg-sky-600',
  'bg-teal-400 hover:bg-teal-500',
  'bg-yellow-400 hover:bg-yellow-500',
];

export default function App() {
  // 仮データを定義
  const initialData: ColumnType[] = [
    {
      id: `container-${uuidv4()}`,
      title: 'BACKLOG',
      items: [],
      borderColorClass: containerColors[0],
      iconColorClass: iconColors[0],
      buttonColorClass: buttonColors[0],
      onAddItem: () => { },
      onClickEdit: () => { },
    },
    {
      id: `container-${uuidv4()}`,
      title: 'ANDAMENTO',
      items: [],
      borderColorClass: containerColors[1],
      iconColorClass: iconColors[1],
      buttonColorClass: buttonColors[1],
      onAddItem: () => { },
      onClickEdit: () => { },
    },
    {
      id: `container-${uuidv4()}`,
      title: 'ENTREGA',
      items: [],
      borderColorClass: containerColors[2],
      iconColorClass: iconColors[2],
      buttonColorClass: buttonColors[2],
      onAddItem: () => { },
      onClickEdit: () => { },
    },
    {
      id: `container-${uuidv4()}`,
      title: 'CONCLUIDO',
      items: [],
      borderColorClass: containerColors[3],
      iconColorClass: iconColors[3],
      buttonColorClass: buttonColors[3],
      onAddItem: () => { },
      onClickEdit: () => { },
    },
  ];


  const [columns, setColumns] = useState<ColumnType[]>(initialData);
  const router = useRouter();
  const { slug } = router.query;
  const { t } = useTranslation('common');

  async function fetchItemFromAPI(slug) {

    try {
      const response = await fetch(`/api/teams/${slug}/order`, {
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchItemFromAPI(slug);
      console.log('Fetched data:', data);  // Adicione este log

      if (data && Array.isArray(data.orders)) {
        // Mapeie os dados recebidos para os containers
        const updatedContainers = columns.map(container => ({
          ...container,
          items: data.orders.filter(order => order.status === container.title)
        }));

        setColumns(updatedContainers);
      } else {
        toast.error('Failed to fetch orders');
        console.error('Data fetched is not an array:', data);
      }

    };

    fetchData();
  }, [slug]);



  const findColumn = (unique: string | null) => {
    if (!unique) {
      return null;
    }
    // overの対象がcolumnの場合があるためそのままidを返す
    if (columns.some((c) => c.id === unique)) {
      return columns.find((c) => c.id === unique) ?? null;
    }
    const id = String(unique);
    const itemWithColumnId = columns.flatMap((c) => {
      const columnId = c.id;
      return c.items.map((i) => ({ itemId: i.id, columnId: columnId }));
    });
    const columnId = itemWithColumnId.find((i) => i.itemId === id)?.columnId;
    return columns.find((c) => c.id === columnId) ?? null;
  };



  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, delta } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null;
    }
    setColumns((prevState) => {
      const activeItems = activeColumn.items;
      const overItems = overColumn.items;
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = overItems.findIndex((i) => i.id === overId);
      const newIndex = () => {
        const putOnBelowLastItem =
          overIndex === overItems.length - 1 && delta.y > 0;
        const modifier = putOnBelowLastItem ? 1 : 0;
        return overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      };
      return prevState.map((c) => {
        if (c.id === activeColumn.id) {
          c.items = activeItems.filter((i) => i.id !== activeId);
          return c;
        } else if (c.id === overColumn.id) {
          c.items = [
            ...overItems.slice(0, newIndex()),
            activeItems[activeIndex],
            ...overItems.slice(newIndex(), overItems.length)
          ];
          return c;
        } else {
          return c;
        }
      });
    });
  };

  
  const updateOrderStatus = async (orderId, newStatus) => {
    const { slug } = router.query;
    const url = `/api/teams/${slug}/order`;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          newStatus: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      console.log('Order status updated:', data);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    const activeId = String(active.id);
    const overId = over && over.data && over.data.current && over.data.current.sortable   
    ? String(over.data.current.sortable.containerId)   
    : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    // Se não encontrar as colunas ou as colunas forem diferentes, não faz nada  
    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      return;
    }

    const activeIndex = activeColumn.items.findIndex((i) => i.id === activeId);
    const overIndex = overColumn.items.findIndex((i) => i.id === overId);
    const itemToMove = activeColumn.items[activeIndex];
    const newStatus = overColumn.title;

    // Só atualiza se houver mudança na posição  
    if (activeIndex !== overIndex) {
      try {
        await updateOrderStatus(itemToMove.id, newStatus);

        setColumns((prevState) => {
          return prevState.map((column) => {
            if (column.id === activeColumn.id) {
              column.items = arrayMove(overColumn.items, activeIndex, overIndex);
              return column;
            } else {
              return column;
            }
          });
        });
        toast.success(`Pedido movido para a coluna: ${newStatus}`); 
      } catch (error) {
        console.error('Error updating order status or columns:', error);
        // Opcional: adicionar lógica de fallback ou notificação ao usuário  
      }
    }
  };
 
  const sensors = useSensors(

    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
 
 
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <h1 className="font-bold text-2xl">{t('Gestor de Pedidos')}</h1>
      <div
        className="App justify-center"
        style={{ display: "flex", flexDirection: "row", padding: "20px", }}
      >
        {columns.map((column, index) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            items={column.items}
            borderColorClass={containerColors[index % containerColors.length]}
            iconColorClass={iconColors[index % iconColors.length]}
            buttonColorClass={buttonColors[index % iconColors.length]}
            onAddItem={column.onAddItem}
            onClickEdit={column.onClickEdit}  // Passa a classe de borda  
          />
        ))}
      </div>
    </DndContext>
  );
}