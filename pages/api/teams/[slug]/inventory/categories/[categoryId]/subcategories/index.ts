import { validateWithSchema } from '@/lib/zod';
import { categoryIdSchema } from '@/lib/zod/inventory/category.schema';
import { postCategorySubcategorySchema } from '@/lib/zod/inventory/category_subcategory.schema';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { createCategorySubcategory, getAllCategorySubcategories, subcategoryAlreadyInCategory } from 'models/inventory/category_subcategories';
import { getUniqueInventorySubCategory } from 'models/inventory/subcategories';
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

// Return all category's subcategories (with products) 
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    const categoryId = validateWithSchema(categoryIdSchema, req.query._categoryId);
    if (!await getUniqueInventoryCategory(user.team.id, categoryId))
        return res.status(404).json({message: "category id not found"});

    const data = await getAllCategorySubcategories(user.team.id, categoryId);
    const subcategories = data.map(sub => ({
        id: sub.id,
        category: sub.category,
        subcategory: sub.subcategory,
    }))

    return res.status(200).json({subcategories});
}

// Create a category subcategory
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category_subcategory", "create");

    const categoryId = validateWithSchema(categoryIdSchema, req.query._categoryId);
    const { subCategoryId } = validateWithSchema(postCategorySubcategorySchema, req.body);

    // check if category id exist
    const category = await getUniqueInventoryCategory(user.team.id, categoryId);
    if (!category) return res.status(404).json({message: "category id not found"});
    
    // check if subcategory id exist
    const subcategory = await getUniqueInventorySubCategory(user.team.id, subCategoryId);
    if (!subcategory) return res.status(404).json({message: "subcategory id not found"});

    // check if subcategory is already registered in that category
    if (await subcategoryAlreadyInCategory({teamId: user.team.id, categoryId, subCategoryId})) 
        return res.status(403).json({message: `subcategory is already registered in ${category.name}`})

    const category_subcategory = await createCategorySubcategory({
        teamId: user.team.id,
        categoryId,
        subCategoryId
    });

    return res.status(201).json({
        message: "subcategory created successfully",
        category_subcategory_id: category_subcategory.id,
        category: category_subcategory.category,
        subcategory: category_subcategory.subcategory
    })
} 
