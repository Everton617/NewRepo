import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createOrderSchema, validateWithSchema } from "@/lib/zod";
import { ApiError } from "@/lib/errors";
import { IOrder, createOrder } from "models/order";
import { getApiKey } from "models/apiKey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { apiKey } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handleGET(req, res, apiKey);
        break;
      case "POST":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handlePOST(req, res, apiKey);
        break;
      default:
        res.setHeader("Allow", "GET, POST, DELETE, PATCH");
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    const message = error.message || "Something went wrong";
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}

async function handleGET(
    req: NextApiRequest,
    res: NextApiResponse,
    apiKey: string
  ) {
    try {
      const apiKeyData = await getApiKey(apiKey); 
  
      if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;
  
      const orders = await prisma.order.findMany({
        where: { teamId },
        include: {
          orderItems: {
            include: { inventoryProduct: true },
          },
        },
      });
  
      res.status(200).json(orders);
    } catch (error) {
      // ... (Manipulação de erros)
    }
  }

async function validateCEPExistence(cep: string) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new ApiError(404, "CEP does not exist!");
    return {
        rua: data.logradouro,
        cidade: data.localidade,
        estado: data.uf
    };
}



async function handlePOST(
    req: NextApiRequest,
    res: NextApiResponse,
    apiKey: string 
  ) {
    try {
      if (!req.body.order) throw new Error("Order not provided");
  
      const apiKeyData = await getApiKey(apiKey);
  
      if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;
  
      // Obter userId usando teamId (ajuste o modelo/relacionamento conforme necessário)
      const teamMember = await prisma.teamMember.findFirst({
        where: { teamId },
        select: { userId: true }, // Seleciona apenas o userId
      });
  
      if (!teamMember) {
        return res.status(404).json({ error: { message: "User not found in this team" } });
      }
  
      const userId = teamMember.userId;
  
      const reqOrder = validateWithSchema(createOrderSchema, req.body.order);
      const address = await validateCEPExistence(reqOrder.cep);
  
      const order = {
        ...reqOrder,
        ...address,
        horario: new Date(),
        createdBy: userId, 
        teamId: teamId,    
        userId: userId     
      } as IOrder;
  
      const newOrder = await createOrder(order);
      const data: Record<string, string | number | Date | string[]> = {};
      Object.entries(newOrder).forEach(([key, value]) => {
          if (key !== "teamId" && key !== "userId" && key !== "createdAt" && key !== "updatedAt") {
              data[key] = value;
          }
      });
      console.log(data);
      return res.json({ data, message: "Order created!" });
      // ... (código para formatar a resposta - igual ao anterior)
    } catch (error) {
      // ... (Manipulação de erros) 
    }
  } 