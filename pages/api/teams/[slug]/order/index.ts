import type { NextApiRequest, NextApiResponse } from "next";
import { throwIfNoTeamAccess } from "models/team";
import {
    IOrder,
    createOrder,
    deleteOrder,
    getOrders,
    updateOrderStatus
} from "models/order";
import { createOrderSchema, validateWithSchema } from "@/lib/zod";
import { ApiError } from "@/lib/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { teamId, user } = await throwIfNoTeamAccess(req, res);
        switch (req.method) {
            case "GET":
                await handleGET(req, res, teamId);
                break;
            case "POST":
                await handlePOST(req, res, teamId, user);
                break;
            case "DELETE":
                await handleDELETE(req, res);
                break;
            case "PATCH":
                await handlePATCH(req, res);
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
async function handleGET(req: NextApiRequest, res: NextApiResponse, teamId: string) {
    // throw if not allowed  
    const orders = Array.from(await getOrders(teamId));
    console.log("got orders successfully");
    console.log(orders);
    return res.status(200).json({ orders });
}




const testUpdateOrder = {
    id: "348452ac-895f-429f-a460-3f72ccc903f8",
    pedido: "3x pastel de uva",
    quantidade: 2,
    status: "ANDAMENTO",
    entregador: "Marcelo",
    numero: "12",
    complemento: "perto dali",
    cep: "59158-210",
    tel: "(84) 98752-2972",
    metodo_pag: "cartao",
    instrucoes: "sem tijoloa"
};

console.log(testUpdateOrder);

const testNewOrder = {
    nome: "pedro",
    orderItems: [{
        nome: "teste",
        quantidade:2
    }],
    valor: 2,
    status: "ANDAMENTO",
    entregador: "Marcelo",
    numero: "12",
    complemento: "perto dali",
    cep: "59158-210",
    tel: "(84) 98752-2972",
    metodo_pag: "cartao",
    instrucoes: "sem tijoloa"
};

const inDev = false;


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
    team_id: string,
    user: any
) {
    // throw if not allowed?  
    if (!req.body.order) throw new Error("Order not provided");
    const reqOrder = inDev ? validateWithSchema(createOrderSchema, testNewOrder) : validateWithSchema(createOrderSchema, req.body.order); // validate cep and phone inside  
    const address = await validateCEPExistence(reqOrder.cep);
    const order = {
        ...reqOrder,
        ...address,
        horario: new Date(),
        createdBy: user.name,
        teamId: team_id,
        userId: user.id
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
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const orderId = req.body.orderId;
    if (!orderId) throw new ApiError(406, "Order id not provided");
    await deleteOrder(orderId);
    return res.json({ message: "Order deleted successfully" });
}

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {
    if (!req.body.orderId || !req.body.newStatus) {
        throw new ApiError(400, "Order ID and new status must be provided");
    }

    const { orderId, newStatus } = req.body;

    // Optionally, you could validate the newStatus to ensure it's a valid status.  

    // Update the order status in the database  
    try {
        await updateOrderStatus(orderId, newStatus);
        return res.json({ message: "Order status updated successfully" });
    } catch (error) {
        console.error('Failed to update order status:', error);
        throw new ApiError(500, "Failed to update order status");
    }
}

