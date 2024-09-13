import { z } from 'zod'

export const FormDataSchema = z.object({
  pedido: z.string().nonempty('O pedido é obrigatório.'),
  quantidade: z.string()
    .refine((val) => !isNaN(Number(val)), {
      message: "A quantidade deve ser um número",
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 1, {
      message: "É necessário que a quantidade seja maior que 0 ",
    }),
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