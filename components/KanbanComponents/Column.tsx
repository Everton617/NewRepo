import { FC, useState, useEffect } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"




import { useRouter } from 'next/router';
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";
import { Plus, Minus } from "lucide-react"
import { FaTrash } from "react-icons/fa6";

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

interface products {
  id: string;
  name: string
  stockQuant: number;
  salePrice: number;
  quantity: number;
}



interface pedido extends products { }



const Column: FC<ColumnType> = ({ id, title, items, onClickEdit, borderColorClass, iconColorClass, buttonColorClass }) => {
  const { setNodeRef } = useDroppable({ id: id });
  const { t } = useTranslation('common');
  const [newTitle, setNewTitle] = useState(title);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [products, setProducts] = useState<products[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [pedidos, setPedidos] = useState<pedido[]>([]);

  const router = useRouter();
  const { slug } = router.query;

  const [order, setOrders] = useState<CardType[]>(items);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  });

  const processForm: SubmitHandler<Inputs> = data => {
    console.log(data);
    console.log()
    reset();
    onAddItem(data);
    setShowAddItemModal(false);
  };

  async function fetchItemFromAPI() {
    console.log('atualizando');
    try {
      const response = await fetch(`/api/teams/${slug}/order`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);

        return data;
      } else {
        console.error('Expected an array but got:', JSON.stringify(data.orders, null, 2));
        console.log("Orders from Prisma:",);
      }


    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }



  const fetchProducts = async () => {

    try {
      const response = await fetch(`/api/teams/${slug}/inventory/products`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        console.log(await response.json())
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      if (Array.isArray(data.inventoryProducts)) {
        setProducts(data.inventoryProducts);

    
      } else {

        console.error('Expected an array but got:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar Subcategorias:', error);
    }
  };



  useEffect(() => {

    setOrders(items);
    fetchProducts()
  }, [items]);



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
    
    const { nome, entregador, numero, complemento, cep, tel, metodo_pag, instrucoes } = data;
   
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
    const produtosResumo = pedidos.map((produto) => ({
      productId: produto.id,
      quantidade: produto.quantity,
    }));


    console.log('Container title:', title); // Certifique-se de que 'title' está definido

    
    const order = {
      orderItems: produtosResumo,
      nome,
      valor: valorTotal,
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
      console.log(order)

      const data = await response.json();
      console.log("response ==> ", data);
      toast.success('Pedido adicionado com sucesso!');
      fetchItemFromAPI();
      setPedidos([])
    } catch (error) {
      console.error("error ==> ", error);
      toast.error('Erro ao adicionar o pedido');
    }
  };

  const showItemModal = () => {
    setShowAddItemModal(true);
  };


  const handleChangeTitle = async () => {
    if (newTitle !== title) {
      try{
        const response = await fetch(`/api/teams/${slug}/containers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            containerId: id,
            newName: newTitle,
           }),
        });

        const data = await response.json();
        console.log("response ==> ", data);
      }catch(error){
        console.log("Error trying to rename Container", error)
        toast.error("Error trying to rename Container")
      }
      onClickEdit();
    }
  };




  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const setPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const adicionarPedido = (productId) => {
    // Verifica se o produto já está no pedido
    const existingProductIndex = pedidos.findIndex( // Corrigido: currentItems -> pedidos
      (item) => item.id === productId
    );

    if (existingProductIndex !== -1) {
      // Se o produto já existe, aumenta a quantidade
      const updatedItems = [...pedidos];
      updatedItems[existingProductIndex].quantity += 1;
      setPedidos(updatedItems);
    } else {
      // Se o produto não existe, adiciona ao pedido com quantidade 1
      const productToAdd = products.find((product) => product.id === productId);

      if (productToAdd) {
        setPedidos([...pedidos, { ...productToAdd, quantity: 1 }]);
        
      } else {
        // Tratar o caso em que o produto não é encontrado
        console.error("Produto não encontrado!");
      }
    }
  };

  const removerPedido = (productId) => {
    // Encontra o índice do produto no pedido
    const productIndex = pedidos.findIndex(
      (item) => item.id === productId
    );

    if (productIndex !== -1) {
      // Se o produto existe...
      const updatedItems = [...pedidos];
      if (updatedItems[productIndex].quantity > 1) {
        // Se a quantidade for maior que 1, diminui a quantidade
        updatedItems[productIndex].quantity -= 1;
      } else {
        // Se a quantidade for 1, remove o produto do pedido
        updatedItems.splice(productIndex, 1);
      }
      setPedidos(updatedItems);
    }
  };

  const valorTotal = pedidos.reduce((total, pedido) => {
    return total + pedido.salePrice * pedido.quantity;
  }, 0);

  const deletarPedido = (productId: string) => {
    // Filtra o array 'pedidos' para manter apenas os pedidos cujo ID não corresponde ao ID a ser removido
    const updatedItems = pedidos.filter((item) => item.id !== productId);
    setPedidos(updatedItems);
  };




  return (
    <SortableContext id={id} items={order} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`${borderColorClass} ${iconColorClass}`}
        style={{
          minWidth: "450px",
          background: "rgba(245,247,249,1.00)",
          marginRight: "10px",
          borderRadius: "10px"
        }}
      >
        <div className="flex justify-between items-center">
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
                    id={id}
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
        {order.map((card, index) => (
          <Card
            index={index}
            key={card.id}
            id={card.id}
            nome={card.nome}
            valor={card.valor}
            orderItems={card.orderItems}
            createdAt={card.createdAt}
            entregador={card.entregador}
            rua={card.rua}
            numero={card.numero}
            complemento={card.complemento}
            cep={card.cep}
            cidade={card.cidade}
            estado={card.estado}
            tel={card.tel}
            metodo_pag={card.metodo_pag}
            instrucoes={card.instrucoes}
            motivo_cancelamento={card.motivo_cancelamento}
          />
        ))}
      </div>
      {showAddItemModal && (
        <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
          <DialogContent className="min-w-[1400px] min-h-[950px]">
            <div><DialogTitle className="text-xl font-bold">{t('Adicione um novo Pedido')}</DialogTitle></div>
            <form onSubmit={handleSubmit(processForm)}
              className='flex flex-col w-full'>

              <div className="flex  ">

                <div className="pr-10 flex flex-col">
                  <div className="pl-[24px] "><h1 className="text-lg font-semibold mb-6">{t('Informações do destinatário')}</h1></div>
                  <div className="grid grid-cols-2 max-h-[100px] gap-4">
                    <div className=" pb-10">
                      <label className='text-black block '>{t('Nome: ')}</label>
                      <input
                        placeholder='Insira o nome do destinatário'
                        className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                        {...register('nome', { required: 'O nome é obrigatório.' })}
                         // Adiciona o evento onChange para buscar dados do CEP
                      />
                      {errors.nome?.message && (
                        <p className='text-sm text-red-400'>{errors.nome.message}</p>
                      )}
                    </div>
                    <div className="">
                      <label className='text-black block '>{t('CEP: ')}</label>
                      <input
                        placeholder='Insira o cep do destinatário'
                        className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                        {...register('cep', { required: 'O CEP é obrigatório.' })}
                        onChange={handleCEPChange}
                        // Adiciona o evento onChange para buscar dados do CEP
                      />
                      {errors.cep?.message && (
                        <p className='text-sm text-red-400'>{errors.cep.message}</p>
                      )}
                    </div>
                    <div className="pb-10">
                      <label className='text-black block'>{t('Estado: ')}</label>
                      <input
                        readOnly
                        placeholder='Insira o estado do destinatário'
                        className={`rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl hover:cursor-not-allowed w-60 `}
                        {...register('estado')}
                      />
                      {errors.estado?.message && (
                        <p className='text-sm text-red-400'>{errors.estado.message}</p>
                      )}
                    </div>
                    <div className="">
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
                    <div className="pb-10 ">
                      <label className='text-black block'>{t('Rua: ')}</label>
                      <input
                        placeholder='Insira a rua do destinatário'
                        readOnly
                        className={`rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl hover:cursor-not-allowed  w-60 `}
                        {...register('rua')}
                      />
                      {errors.rua?.message && (
                        <p className='text-sm text-red-400'>{errors.rua.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col ">
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
                    <div className="flex flex-col  pb-10">
                      <label className='text-black '>{t('Complemento: ')}</label>
                      <input
                        placeholder=''
                        className='rounded-lg border p-2 bg-white rounded-lg hover:shadow-xl w-60'
                        {...register('complemento')}
                      />
                      {errors.complemento?.message && (
                        <p className='text-sm text-red-400'>{errors.complemento.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
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
                  </div>
                </div>

                <Separator orientation="vertical" className="mr-10" />

                <div className="flex flex-col gap-4 min-w-[500px]">
                  <div><h1 className="text-lg font-semibold mb-6">{t('Informações do Pedido')}</h1></div>
                  <div className="">
                    <div className="flex gap-4 pl-7  items-center">
                      <label className="text-black block pb-2">{t('Escolha um pedido')}</label>
                      <input
                        className="border-gray-300 border-2 rounded-md h-8 min-w-[300px] pl-2"
                        type="text"
                        placeholder="Pesquisar Pedido"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>

                    <table className="table min-w-[700px]">
                      <thead>
                        <tr>
                          <th>{t('Produto')}</th>
                          <th>{t('Preço')}</th>
                          <th>{t('Quantidade')}</th>
                          <th>{t('Ações')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{t('R$')} {product.salePrice.toFixed(2)}</td>
                            <td>
                              {product.stockQuant} <span className="text-xs">{t('unidades')}</span>
                            </td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removerPedido(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => adicionarPedido(product.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-center ">
                      <Pagination className="">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={prevPage}>{t('Anterior')}</PaginationPrevious>
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, index) => (
                            <PaginationItem key={index}>
                              <PaginationLink href="#" onClick={() => setPage(index + 1)} isActive={currentPage === index + 1}>
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>

                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={nextPage}>{t('Próximo')}</PaginationNext>
                          </PaginationItem>

                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col w-full ">
                    <label className='text-black'>{t('Instruções Especiais: ')}</label>
                    <textarea
                      className="textarea textarea-bordered bg-gray-100 text-black max-h-[100px]"
                      placeholder="Caso exista, informe alguma instrução"
                      {...register('instrucoes')}
                    ></textarea>
                  </div>

                  <div className="flex flex-row gap-2">
                    <div className="space-y-2 flex flex-col 
                    ">
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
                    <div className="space-y-2  flex flex-col">
                      <label className='text-black'>{t('Informações do Pagamento: ')}</label>
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
                  <div className="space-y-2 flex flex-col w-full min-h-[100px] max-h-[150px] overflow-y-auto bg-gray-100 rounded-lg p-2 text-black">
                    <label className="text-black">{t('Informações do pedido: ')}</label>

                    <ul className="list-disc list-inside">
                      {pedidos.map((pedido, index) => (
                        <li key={index} className="flex items-center">
                          {pedido.name} {t('- Quantidade:')} {pedido.quantity}
                          <div className=" flex bg-white p-2 rounded-md items-center justify-center ml-2 cursor-pointer text-red-400 hover:bg-red-400 hover:text-white" onClick={() => deletarPedido(pedido.id)}>
                            <FaTrash  className=" " />
                          </div>
                        </li>
                      ))}
                    </ul>

                  </div>
                  <span className="flex flex-row font-bold text-right text-lg">
                   {t('Valor Total:')}<div className="text-gray-600">{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </span>

                </div>





              </div>

              <div className='p-5 flex justify-end mt-10'>
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
