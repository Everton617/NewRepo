import { ApiError } from '@/lib/errors';
import { validateWithSchema } from '@/lib/zod';
import { deleteCategory, getUniqueInventoryCategory } from 'models/inventory/categories';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE');
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
    
    if (!req.query._categoryId) return res.status(422).json({message: "Missing query parameters: missing 'id'"});
    const categoryId = validateWithSchema(z.string().uuid(), req.query._categoryId);
    const category = await getUniqueInventoryCategory(user.team.id, categoryId);

    if (!category) return res.status(404).json({message: "Category Id not found"});

    return res.status(200).json(category);
}


async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category", "delete");
    
    if (!req.query._categoryId) return res.status(422).json({message: "Missing query parameters: missing 'id'"});

    const id = validateWithSchema(z.string().uuid(), req.query._categoryId);
    if (!await getUniqueInventoryCategory(user.team.id, id)) return res.status(404).json({message: "id not found"})
    await deleteCategory(user.team.id, id);

    return res.status(200).json({message: "category deleted successfully"});
}
