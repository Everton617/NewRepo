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

interface Transaction {
  id: string;
  nome: string;
  formadepagamento: string;
  valor: number;
  data: string;
  horario: string;
  nomeentregador: string;
  status: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/teams/${team.slug}/historico')
        if (!response.ok) {
          throw new Error('Falha ao buscar dados')
        }
        const data = await response.json()
        setTransactions(data)
        setLoading(false)
      } catch (err) {
        setError('Erro ao carregar dados. Por favor, tente novamente.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTransactions = transactions.filter(t => 
    t.nome.toLowerCase().includes(filter.toLowerCase()) ||
    t.nomeentregador.toLowerCase().includes(filter.toLowerCase()) || 
    t.data.toLowerCase().includes(filter.toLowerCase()) ||
    t.formadepagamento.toLowerCase().includes(filter.toLowerCase()) ||
    t.status.toLowerCase().includes(filter.toLowerCase())  ||
    t.id.toString() === filter
        
  )

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finalizado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      case 'pendente':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>
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
            <DropdownMenuItem>Forma de Pagamento</DropdownMenuItem>
            <DropdownMenuItem>Valor</DropdownMenuItem>
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
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
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
                <TableCell>{transaction.formadepagamento}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.valor)}</TableCell>
                <TableCell>{transaction.data}</TableCell>
                <TableCell>{transaction.horario}</TableCell>
                <TableCell>{transaction.nomeentregador}</TableCell>
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

