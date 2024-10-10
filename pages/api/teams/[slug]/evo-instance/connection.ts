import { ApiError } from '@/lib/errors';
import { disconnectFromEvoInstance, getInstanceStatus, requestEvoInstanceConnection } from 'models/evoInstance';
import {
  getCurrentUserWithTeam,
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PUT':
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST, DELETE');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_evo_instance", "update");
    
    const instanceKey = user.team.evo_instance_key;
    const instanceName = user.team.evo_instance_name;

    // if dont exist, create a new instance
    if (!instanceKey || !instanceName) throw new ApiError(500, "no instanceKey | instanceName provided");
    const data = await getInstanceStatus(instanceName, instanceKey);
    return res.json({status: data.instance});
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_evo_instance", "update");

    const QRcode = await requestEvoInstanceConnection(user.team.slug);

    return res.json({QRcode})
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_evo_instance", "leave");

    if (!user.team.evo_instance_name) throw new ApiError(500, "No instance available");
    await disconnectFromEvoInstance(user.team.evo_instance_name);

    return res.json({message: "disconnected successfully"})
}
