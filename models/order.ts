import { prisma } from "@/lib/prisma";  
import { OrderStatus } from "@prisma/client";  
  
export enum EOrderStatus {  
    BACKLOG = "BACKLOG",  
    ANDAMENTO = "ANDAMENTO",  
    ENTREGA = "ENTREGA",  
    CONCLUIDO = "CONCLUIDO",  
};  
  
export interface IOrder {  
    id?: string,  
    pedido: string[]; 
    status: OrderStatus,  
    horario: Date,  
    entregador: string,  
    rua: string,  
    numero: string,  
    complemento: string,  
    cep: string,  
    cidade: string,  
    estado: string,  
    tel: string,  
    metodo_pag: string,  
    instrucoes: string,  
    createdBy: string,  
    teamId: string,  
    userId: string  
};  
  
export const orderSelects = {  
    id: true,  
    pedido: true,  
    quantidade: true,  
    status: true,  
    entregador: true, 
     motivo_cancelamento: true,
    rua: true,  
    numero: true,  
    complemento: true,  
    cep: true,  
    cidade: true,  
    estado: true,  
    tel: true,  
    metodo_pag: true,  
    instrucoes: true,  
    createdBy: true,  
    createdAt: true
}  
  
export async function createOrder(order: any) {  
    return await prisma.order.create({  
        data: order  
    });  
}  
  
export async function deleteOrder(orderId: string) {  
    return await prisma.order.delete({  
        where: { id: orderId }  
    })  
}  
  
export async function updateOrder(id: string, order: any) {  
    return await prisma.order.update({  
        where: { id: id },  
        data: order,  
        select: orderSelects  
    })  
}  
  
export async function getOrders(teamId: string) {  
    return await prisma.order.findMany({  
        where: { teamId: teamId },  
        select: orderSelects  
    })  
}  
  
export async function getUniqueOrder(id: string, teamId: string) {  
    return await prisma.order.findFirst({  
        where: { id: id, teamId: teamId },  
        select: orderSelects  
    });  
}  
  
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {  
    return await prisma.order.update({  
        where: { id: orderId },  
        data: { status: newStatus },  
        select: orderSelects  
    });  
}  
