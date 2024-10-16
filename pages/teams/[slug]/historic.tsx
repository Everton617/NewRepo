'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from 'next/router'
interface Transaction {
  id: string;
  nome: string;
  pedido: string[];
  metodo_pag: string;
  data: string;
  valor: number;
  horario: string;
  entregador: string;
  status: string;
  createdAt: string
}
export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]); // Filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const router = useRouter();
  const { slug } = router.query;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/teams/${slug}/orderHistorico`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Falha ao buscar dados');
          
        }
       
      
        const data = await response.json();
        console.log("Transações: ", data)
        setTransactions(data.orders);
        setLoading(false);
      } catch (err) {
        
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, refresh]);
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(true);
    }, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const filtered = transactions.filter((t) => {
      const filterLower = filter.toLowerCase();
      const idString = t.id.toString();
      const formattedDate = formatDateString(t.horario);
      const pedidoMatches =
        t.pedido &&
        Array.isArray(t.pedido) &&
        t.pedido.some((p) => p.toLowerCase().includes(filterLower));
      return (
        pedidoMatches ||
        t.entregador.toLowerCase().includes(filterLower) ||
        t.nome.toLowerCase().includes(filterLower) ||
        t.metodo_pag.toLowerCase().includes(filterLower) ||
        t.status.toLowerCase().includes(filterLower) ||
        t.valor.toString().includes(filterLower) ||
        formattedDate.toLowerCase().includes(filterLower) ||
        t.horario.toLowerCase().includes(filterLower) ||
        idString === filterLower
      );
    });
    setFilteredTransactions(filtered);
  }, [transactions, filter]);
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  function formatDateString(dateString) {
    const date = new Date(dateString);
    // Extract the day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0');  
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  function splitHorario(horarioString: string): { date: string, time: string } {
    try {
      const dateObject = new Date(horarioString); // Create a Date object
      // Extract and format date components
      const day = dateObject.getUTCDate().toString().padStart(2, '0');
      const month = (dateObject.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
      const year = dateObject.getUTCFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      // Extract and format time components
      const hours = dateObject.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObject.getUTCMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error("Invalid horario format:", horarioString, error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  }
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Histórico</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Filtrar ID, Nome, Pagamento, Data, Entregador ou Status."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Alternar Colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Id Pedido</DropdownMenuItem>
            <DropdownMenuItem>Nome</DropdownMenuItem>
            <DropdownMenuItem>Valor</DropdownMenuItem>
            <DropdownMenuItem>Forma de Pagamento</DropdownMenuItem>
            <DropdownMenuItem>Data</DropdownMenuItem>
            <DropdownMenuItem>Horário</DropdownMenuItem>
            <DropdownMenuItem>Nome do Entregador</DropdownMenuItem>
            <DropdownMenuItem>Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.length === filteredTransactions.length}
                  onCheckedChange={() => {
                    if (selectedRows.length === filteredTransactions.length) {
                      setSelectedRows([])
                    } else {
                      setSelectedRows(filteredTransactions.map(t => t.id))
                    }
                  }}
                />
              </TableHead>
              <TableHead>Id Pedido</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Nome do Entregador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(transaction.id)}
                    onCheckedChange={() => toggleRowSelection(transaction.id)}
                  />
                </TableCell>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.nome}</TableCell>
                <TableCell>{transaction.valor}</TableCell>
                <TableCell>{transaction.metodo_pag}</TableCell>
                <TableCell>{splitHorario(transaction.createdAt).date}</TableCell>
                <TableCell>{splitHorario(transaction.horario).time}</TableCell>
                <TableCell>{transaction.entregador}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Baixar recibo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-gray-500">
          {selectedRows.length} de {filteredTransactions.length} linha(s) selecionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Página anterior')}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Próxima página')}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}