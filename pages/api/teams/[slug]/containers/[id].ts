import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUserWithTeam, throwIfNoTeamAccess} from "models/team";
import { ApiError } from "@/lib/errors";
import { getUniqueContainer, updateContainer, getContainers } from "models/container";
import { throwIfNotAllowed } from "models/user";
import { updateOrderSchema, validateWithSchema } from "@/lib/zod";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await throwIfNoTeamAccess(req, res);

        switch (req.method) {
            case "GET":
                await handleGET(req, res);
                break;
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

async function handleGET(req: NextApiRequest, res: NextApiResponse){
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_contact", "read");

    const teamId = user.team.id;
    if(!teamId) throw new ApiError(422, "missing required teamId");

    const containers = await getContainers(teamId as string)

    return res.status(200).json({ message: "Containers listed successfully", containers: containers })
}

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_order", "update");

    const containerId = req.query.id;
    const { changes } = req.body;
    if (!containerId) throw new ApiError(422, "missing required parameter: missing 'id'");
    if (!changes) throw new ApiError(422, "missing required fields: missing 'changes'");

    if (!await getUniqueContainer(containerId as string, user.team.id)) throw new ApiError(404, "container id not found");
    validateWithSchema(updateOrderSchema, changes);
    const updatedContainer = await updateContainer(containerId as string, changes);

    return res.status(200).json({ message: "Container name updated successfully", container: updatedContainer });
}
