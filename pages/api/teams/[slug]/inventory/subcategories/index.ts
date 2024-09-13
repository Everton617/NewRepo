import { ApiError } from '@/lib/errors';
import { validateWithSchema } from '@/lib/zod';
import { postSubCategorySchema } from '@/lib/zod/inventory/subcategory.schema';
import { createInventorySubCategory, getAllInventorySubCategories } from 'models/inventory/subcategories';
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
    const subCategories = await getAllInventorySubCategories(user.team.id);
    return res.status(200).json({subCategories});
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category", "create");
   
    if (!req.body.subcategory) throw new ApiError(422, "Missing body parameters: missing 'category'");
    const subcategory = validateWithSchema(postSubCategorySchema, req.body.subcategory);
    const newSubcategory = await createInventorySubCategory(user.team.id, subcategory);

    return res.status(200).json({message: "subcategory created successfully", newSubcategory});
}
