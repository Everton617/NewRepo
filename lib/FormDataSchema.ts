import { z } from 'zod'

export const FormDataSchema = z.object({

  nome: z.string().nonempty('O nome é obrigatório.'),
  valor:  z.number().optional(),
  rua: z.string().nonempty('A rua é obrigatória.'),
  numero:  z.string().nonempty('O número é obrigatório.'),
  horario:  z.string().optional(),
  complemento: z.string().nonempty('O complemento é obrigatório.'),
  cep: z.string().nonempty('O CEP é obrigatório.').min(8, { message: "O cep deve ter pelo menos 8 números" }),
  cidade: z.string().nonempty('A cidade é obrigatória.'),
  tel: z.string().nonempty('O telefone é obrigatório.'),
  estado: z.string().nonempty('O estado é obrigatório.'),
  entregador: z.string().nonempty('O nome do entregador é obrigatório.'),
  metodo_pag: z.string().nonempty('A forma de pagamento é obrigatória.'),
  instrucoes: z.string().nonempty('As instruções é obrigatória.'),
})