import type { NextApiRequest, NextApiResponse } from "next";  
import { throwIfNoTeamAccess } from "models/team";  
import {   
    IContainer,   
    createContainer,   
    deleteContainer,   
    updateContainer,
    getContainers
} from "models/container";  
import { validateWithSchema } from "@/lib/zod";  
import { ApiError } from "@/lib/errors";  


export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
    try {  
        const { teamId, user } = await throwIfNoTeamAccess(req, res);  
        switch (req.method) {  
            case "GET":  
                await handleGET(req, res, teamId);  
                break;  
            case "POST":  
                await handlePOST(req, res, teamId);  
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
    const containers = Array.from(await getContainers(teamId));  
    console.log("got containers successfully");  
    console.log(containers);  
    return res.status(200).json({ containers });  
}  

async function handlePOST(  
    req: NextApiRequest,  
    res: NextApiResponse,  
    team_id: string  
) {  
    // throw if not allowed?  
    if (!req.body.container) throw new Error("Container not provided");  
    const { name } = req.body.name
    const container = {  
        name: name,
        teamId: team_id,
    }  as IContainer;  

    const newContainer = await createContainer(container);  

    const data: Record<string, string | number | Date> = {};  

    /*Object.entries(newContainer).forEach(([key, value]) => {  
        if (key !== "teamId" && key !== "userId" && key !== "createdAt" && key !== "updatedAt") {  
            data[key] = value;  
        }  
    });  
    console.log(data);  */
    return res.json({ data, message: "Container created!" });  
}  

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {  
    const containerId = req.body.containerId;  
    if (!containerId) throw new ApiError(406, "Container id not provided");  
    await deleteContainer(containerId);  
    return res.json({ message: "Container deleted successfully" });  
}  

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {  
    if (!req.body.containerId || !req.body.newName) {  
        throw new ApiError(400, "Container ID and new status must be provided");  
    }  
  
    const { containerId, newName } = req.body;  
  
    try {  
        await updateContainer(containerId, newName);  
        return res.json({ message: "Container name updated successfully" });  
    } catch (error) {  
        console.error('Failed to update container name:', error);  
        throw new ApiError(500, "Failed to update container name");  
    }  
}  