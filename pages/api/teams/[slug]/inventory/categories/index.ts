import { ApiError } from '@/lib/errors';
import { validateWithSchema } from '@/lib/zod';
import { postCategorySchema } from '@/lib/zod/inventory/category.schema';
import { 
    createInventoryCategory, 
    getAllInventoryCategories, getInventoryCategoriesByFilters } from 'models/inventory/categories';
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
      default:
        res.setHeader('Allow', 'GET, POST');
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
    const categories = await getAllInventoryCategories(user.team.id);
    return res.status(200).json({categories});
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category", "create");
    if (!req.body.category) return res.status(422).json({message: "Missing body parameters: missing 'category'"});
    const incoming_category = validateWithSchema(postCategorySchema, req.body.category);
    const exist_category = await getInventoryCategoriesByFilters({
        teamId: user.team.id,
        name: incoming_category.name
    });
    if (exist_category)
        return res.status(403).json({message: `category with name '${incoming_category.name}' is already registered`});

    const category = await createInventoryCategory(user.team.id, validateWithSchema(postCategorySchema, incoming_category));

    return res.status(200).json({message: "category created successfully", category});
}
