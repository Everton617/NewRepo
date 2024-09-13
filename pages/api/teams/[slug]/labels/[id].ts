import { validateWithSchema } from '@/lib/zod';
import { newUniqueLabelSchema } from '@/lib/zod/label.schema';
import { deleteUniqueLabel, getUniqueLabel, updateLabel } from 'models/label';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
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
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT, DELETE');
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

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    throwIfNotAllowed(user, "team_label", "delete");

    const labelId = req.query.id;
    if (!labelId) return res.status(500).json({message: "label id is required"});
    
    if (!await getUniqueLabel(labelId as string, user.team.id))
        return res.status(404).json({message: "label was already deleted or do not exist"})
    await deleteUniqueLabel(labelId as string, user.team.id);

    return res.json({message: "label deleted!"});
}


async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    throwIfNotAllowed(user, "team_label", "update");
    
    const labelId = req.query.id;
    if (!labelId) return res.status(500).json({message: "label id is required"});
    
    // validate label data to be updated with schema
    const labelData = validateWithSchema(newUniqueLabelSchema, req.body.label);

    if (!await getUniqueLabel(labelId as string, user.team.id)) return res.status(404).json({message: "label not found"})

    await updateLabel(labelId as string, labelData, user.team.id);

    return res.json({message: "label updated"});
}
