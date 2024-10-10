import { z } from "zod";  
  
export const name = z.string();  
export const cep = z.string();  
export const cnpj = z.string();  
export const address = z.string();  
export const cidade = z.string();  
export const estado = z.string();  
export const country = z.string();  
export const wpp = z.string()  
  
export const newContactSchema = z.object({  
  name: name,  
  cep: cep.optional(),  
  address: address.optional(),  
  cidade: cidade.optional(),  
  estado: estado.optional(),  
  country: country.optional(),  
  phone: wpp.optional(),  
  wpp: wpp.optional(),  
  obs: z.string().optional(),  
  emp_nome: z.string().optional(),  
  cnpj: cnpj.optional(),  
  emp_address: address.optional(),  
  emp_cidade: cidade.optional(),  
  emp_estado: estado.optional(),  
  emp_country: country.optional(),  
  emp_phone: wpp.optional(),  
 
});  
