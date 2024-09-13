import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUserWithTeam, throwIfNoTeamAccess} from "models/team";
import { ApiError } from "@/lib/errors";
import { getUniqueOrder, updateOrder } from "models/order";
import { throwIfNotAllowed } from "models/user";
import { updateOrderSchema, validateWithSchema } from "@/lib/zod";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await throwIfNoTeamAccess(req, res);

        switch (req.method) {
            case "PATCH":
                await handlePATCH(req, res); // Novo caso para atualizar o status
                break;
            default:
                res.setHeader("Allow", ["PUT", "DELETE", "PATCH"]);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        const message = error.message || "Something went wrong";
        const status = error.status || 500;
        res.status(status).json({ error: { message } });
    }
}

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_order", "update");

    const orderId = req.query.id;
    const { changes } = req.body;
    if (!orderId) throw new ApiError(422, "missing required parameter: missing 'id'");
    if (!changes) throw new ApiError(422, "missing required fields: missing 'changes'");

    if (!await getUniqueOrder(orderId as string, user.team.id)) throw new ApiError(404, "order id not found");
    validateWithSchema(updateOrderSchema, changes);
    const updatedOrder = await updateOrder(orderId as string, changes);

    return res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
}
