import type { NextApiRequest, NextApiResponse } from "next";  
import { throwIfNoTeamAccess } from "models/team";  
import {   
    getFinishedOrders,   
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
    const orders = Array.from(await getFinishedOrders(teamId));  
    console.log("got orders successfully");  
    console.log(orders);  
    return res.status(200).json({ orders });  
}  


