import { validateWithSchema } from '@/lib/zod';
import { newUniqueLabelSchema } from '@/lib/zod/label.schema';
import { createLabel, deleteUniqueLabel, getAllLabels } from 'models/label';
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
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, DELETE');
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
    throwIfNotAllowed(user, "team_label", "read");
    if (!user) throw new Error("No user provided ...");

    // filters
    const where = {};
    if (req.query.name) where['name'] = {contains: req.query.name};
    if (req.query.emoji) where['emoji'] = {contains: req.query.emoji}

    const labels = await getAllLabels(user.team.id, where);
    return res.status(200).json({labels});
}


async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    const label = await createLabel(validateWithSchema(newUniqueLabelSchema, req.body.label), user.team.id);
    return res.status(200).json({label});
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    const labelId = req.body.labelId;
    if (!labelId) return res.status(500).json({message: "label id is required"});

    await deleteUniqueLabel(labelId, user.team.id);

    return res.json({message: "label deleted!"});
}
