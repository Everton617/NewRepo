import { validateWithSchema } from '@/lib/zod';
import { categoryProductIdSchema } from '@/lib/zod/inventory/category_product.schema';
import { categorySubcategoryIdSchema } from '@/lib/zod/inventory/category_subcategory.schema';
import { getUniqueCategorySubcategory } from 'models/inventory/category_subcategories';
import { createCategory_SubCategory_Product, getAllCategorySubCategoryProducts } from 'models/inventory/category_subcategory_products';
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

// Return all category's subcategories's products 
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);

    const category_subcategoryId = validateWithSchema(categorySubcategoryIdSchema, req.query._category_subcategoryId);
    if (!await getUniqueCategorySubcategory(user.team.id, category_subcategoryId))
        return res.status(404).json({message: "category subcategory id not found"});

    const products = await getAllCategorySubCategoryProducts(user.team.id, category_subcategoryId);
    return res.status(200).json({products});
}

// Add a product to a category's subcategory
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category_subcategory_product", "create");

    const category_subcategory_id = validateWithSchema(categorySubcategoryIdSchema, req.query._category_subcategoryId);
    const categorySubcategory = await getUniqueCategorySubcategory(user.team.id, category_subcategory_id);
    if (!categorySubcategory)
        return res.status(404).json({message: "category subcategory id not found"});

    const category_product_id = validateWithSchema(categoryProductIdSchema, req.body.categoryProductId);
    await createCategory_SubCategory_Product({
        teamId: user.team.id,
        category_product_id,
        category_subcategory_id
    });

    return res.status(201).json({message: `product successfully added into ${categorySubcategory.category.name} -> ${categorySubcategory.subcategory.name}`});
}
