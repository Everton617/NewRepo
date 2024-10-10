import { createEvoInstance, getEvoInstance } from 'models/evoInstance';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
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
      case 'PUT':
      case 'DELETE':
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

    let instanceName = user.team.evo_instance_name;
    let instanceKey = user.team.evo_instance_key;

    if (!instanceName || !instanceKey) {
        const { team } = await createEvoInstance(user.team.slug);
        instanceName = team.evo_instance_name as string;
        instanceKey = team.evo_instance_key as string;
    };

    const instance = await getEvoInstance(instanceName);

    return res.json({instance});
}
