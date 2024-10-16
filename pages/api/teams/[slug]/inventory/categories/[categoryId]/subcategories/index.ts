import { validateWithSchema } from '@/lib/zod';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { createCategorySubcategory, getAllCategorySubcategories, subcategoryAlreadyInCategory } from 'models/inventory/category_subcategories';
import { getUniqueInventorySubCategory } from 'models/inventory/subcategories';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';



// Define um esquema de validação para o ID da categoria
const categoryIdSchema = z.string().uuid();
const subCategoryIdSchema = z.string()

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

    const validatedCategoryId = categoryIdSchema.parse(req.query.categoryId);
    if (!await getUniqueInventoryCategory(user.team.id, validatedCategoryId))
        return res.status(404).json({message: "category id not found"});

    const data = await getAllCategorySubcategories(user.team.id, validatedCategoryId);
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

    const validatedCategoryId = categoryIdSchema.parse(req.query.categoryId);
      const { subCategoryId } = req.body; // Extrair o campo subCategoryId
      const validatedSubCategoryId = validateWithSchema(subCategoryIdSchema, subCategoryId); 

    // check if category id exist
    const category = await getUniqueInventoryCategory(user.team.id, validatedCategoryId);
    if (!category) return res.status(404).json({message: "category id not found"});
    
    // check if subcategory id exist
    const subcategory = await getUniqueInventorySubCategory(user.team.id, validatedSubCategoryId);
    if (!subcategory) return res.status(404).json({message: "subcategory id not found"});

    // check if subcategory is already registered in that category
    if (await subcategoryAlreadyInCategory({teamId: user.team.id, categoryId:validatedCategoryId, subCategoryId:validatedSubCategoryId})) 
        return res.status(403).json({message: `subcategory is already registered in ${category.name}`})

    const category_subcategory = await createCategorySubcategory({
        teamId: user.team.id,
        categoryId:validatedCategoryId,
        subCategoryId:validatedSubCategoryId
    });

    return res.status(201).json({
        message: "subcategory created successfully",
        category_subcategory_id: category_subcategory.id,
        category: category_subcategory.category,
        subcategory: category_subcategory.subcategory
    })
} 
