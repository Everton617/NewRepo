import { validateWithSchema } from '@/lib/zod';
import { categoryProductIdSchema } from '@/lib/zod/inventory/category_product.schema';
import { getUniqueCategoryProduct,  removeProductFromCategory } from 'models/inventory/category_products';
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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PATCH, DELETE');
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

// remove a product from a category
async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category_product", "delete");

    const id = validateWithSchema(categoryProductIdSchema, req.query.id);
    if (!await getUniqueCategoryProduct(id))
        return res.status(404).json({message: "id not found"});

    await removeProductFromCategory(user.team.id, id);

    return res.status(200).json({message: "product removed successfully"});
}
