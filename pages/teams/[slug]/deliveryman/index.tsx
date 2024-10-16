'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, Plus } from "lucide-react"

interface Driver {
  id: number
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  vehicleModel: string
  licensePlate: string
  vehicleType: string
  workHours: string
  startTime: string
  endTime: string
  availableDays: string
}

interface FormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  photo: File | null
  id: File | null
  proofOfResidence: File | null
  vehicleDocument: File | null
  vehicleModel: string
  licensePlate: string
  vehicleType: string
  startTime: string
  endTime: string
  availableDays: string[]
}

const states: string[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

const vehicleTypes: string[] = ["Moto", "Bicicleta", "Carro"]

const weekDays: string[] = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
]

export default function DeliveryDriversTable(): React.ReactElement {
  const [filteredDrivers, setFilteredDrivers] = React.useState<Driver[]>([])
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "vehicleModel",
    "licensePlate",
    "vehicleType",
    "workHours",    
  ])
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    photo: null,
    id: null,
    proofOfResidence: null,
    vehicleDocument: null,
    vehicleModel: "",
    licensePlate: "",
    vehicleType: "",
    startTime: "",
    endTime: "",
    availableDays: [],
  })

  React.useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/teams/${team.slug}/drivers')
      if (!response.ok) {
        throw new Error('Failed to fetch drivers')
      }
      const data = await response.json()
      setFilteredDrivers(data.drivers)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase()
    const filtered = filteredDrivers.filter((driver) =>
      Object.values(driver).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm)
      )
    )
    setFilteredDrivers(filtered)
  }

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    }
  }

  const handleAvailabilityChange = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value)
        } else if (key === 'availableDays') {
          formDataToSend.append(key, value.join(','))
        } else {
          formDataToSend.append(key, value as string)
        }
      })

      const response = await fetch('/api/teams/${team.slug}/drivers', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to add driver')
      }

      const result = await response.json()
      console.log('Driver added successfully:', result)

      // Update the drivers list
      setFilteredDrivers(prev => [...prev, result.driver])

      // Close the modal and reset the form
      setIsModalOpen(false)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        photo: null,
        id: null,
        proofOfResidence: null,
        vehicleDocument: null,
        vehicleModel: "",
        licensePlate: "",
        vehicleType: "",
        startTime: "",
        endTime: "",
        availableDays: [],
      })
    } catch (error) {
      console.error('Error adding driver:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex-none w-full p-4 border-b">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Entregadores</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Entregador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Entregador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        name="state"
                        value={formData.state}
                        onValueChange={(value: string) =>
                          setFormData((prev) => ({ ...prev, state: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documentos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="photo">Foto do Entregador</Label>
                      <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept=".jpg,.png"
                        onChange={handleFileUpload}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="id">Documento de Identidade (RG ou CNH)</Label>
                      <Input
                        id="id"
                        name="id"
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="proofOfResidence">Comprovante de Residência</Label>
                      <Input
                        id="proofOfResidence"
                        name="proofOfResidence"
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleDocument">Documento do Veículo (CRLV)</Label>
                      <Input
                        id="vehicleDocument"
                        name="vehicleDocument"
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Veículo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="vehicleModel">Modelo do Veículo</Label>
                      <Input
                        id="vehicleModel"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="licensePlate">Placa do Veículo</Label>
                      <Input
                        id="licensePlate"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                      <Select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onValueChange={(value: string) =>
                          setFormData((prev) => ({ ...prev, vehicleType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Disponibilidade</h3>
                  <div className="space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex flex-wrap gap-4">
                      {weekDays.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.availableDays.includes(day)}
                            onCheckedChange={() => handleAvailabilityChange(day)}
                          />
                          <Label htmlFor={day}>{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Horário de Início</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Horário de Término</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adicionando..." : "Adicionar Entregador"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-grow w-full overflow-hidden">
        <div className="h-full w-full p-4 space-y-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <Input
              className="max-w-sm"
              placeholder="Filtrar entregadores..."
              onChange={handleSearch}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colunas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[
                  "Nome Completo",
                  "Email",
                  "Telefone",
                  "Endereço Completo",
                  "Cidade",
                  "Estado",
                  "Modelo do Veículo",
                  "Placa do Veículo",
                  "Tipo de Veículo",
                  "Horário de Trabalho",
                  "Dias da Semana"
                ].map((column, index) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="capitalize"
                    checked={visibleColumns.includes(
                      Object.keys(filteredDrivers[0] || {})[index + 1]
                    )}
                    onCheckedChange={() =>
                      toggleColumn(Object.keys(filteredDrivers[0] || {})[index + 1])
                    }
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="overflow-auto w-full">
            <Table className="w-full">
              <TableCaption>Lista de Entregadores Disponíveis</TableCaption>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes("fullName") && (
                    <TableHead>Nome Completo</TableHead>
                  )}
                  {visibleColumns.includes("email") && <TableHead>Email</TableHead>}
                  {visibleColumns.includes("phone") && <TableHead>Telefone</TableHead>}
                  {visibleColumns.includes("address") && (
                    <TableHead>Endereço Completo</TableHead>
                  )}
                  {visibleColumns.includes("city") && <TableHead>Cidade</TableHead>}
                  {visibleColumns.includes("state") && <TableHead>Estado</TableHead>}
                  {visibleColumns.includes("vehicleModel") && (
                    <TableHead>Modelo do Veículo</TableHead>
                  )}
                  {visibleColumns.includes("licensePlate") && (
                    <TableHead>Placa do Veículo</TableHead>
                  )}
                  {visibleColumns.includes("vehicleType") && (
                    <TableHead>Tipo de Veículo</TableHead>
                  )}
                  {visibleColumns.includes("workHours") && (
                    <TableHead>Horário de Trabalho</TableHead>
                  )}                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    {visibleColumns.includes("fullName") && (
                      <TableCell>{driver.fullName}</TableCell>
                    )}
                    {visibleColumns.includes("email") && (
                      <TableCell>{driver.email}</TableCell>
                    )}
                    {visibleColumns.includes("phone") && (
                      <TableCell>{driver.phone}</TableCell>
                    )}
                    {visibleColumns.includes("address") && (
                      <TableCell>{driver.address}</TableCell>
                    )}
                    {visibleColumns.includes("city") && (
                      <TableCell>{driver.city}</TableCell>
                    )}
                    {visibleColumns.includes("state") && (
                      <TableCell>{driver.state}</TableCell>
                    )}
                    {visibleColumns.includes("vehicleModel") && (
                      <TableCell>{driver.vehicleModel}</TableCell>
                    )}
                    {visibleColumns.includes("licensePlate") && (
                      <TableCell>{driver.licensePlate}</TableCell>
                    )}
                    {visibleColumns.includes("vehicleType") && (
                      <TableCell>{driver.vehicleType}</TableCell>
                    )}
                    {visibleColumns.includes("workHours") && (
                      <TableCell>{`${driver.startTime} - ${driver.endTime} |  ${driver.availableDays}`}</TableCell>
                    )}                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}