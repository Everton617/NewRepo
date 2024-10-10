import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const historico = await prisma.historico.findMany({
      select: {
        id: true,
        nome: true,              
        formadepagamento: true,    
        valor: true,             
        data: true,              
        horario: true,           
        nomeentregador: true,    
        status: true,            
      },
    });

    res.status(200).json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
}
