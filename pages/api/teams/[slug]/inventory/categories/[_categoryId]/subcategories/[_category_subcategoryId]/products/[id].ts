import { validateWithSchema } from '@/lib/zod';
import { categorySubcategoryIdSchema } from '@/lib/zod/inventory/category_subcategory.schema';
import { productIdSchema } from '@/lib/zod/inventory/product.schema';
import { getUniqueCategorySubcategory } from 'models/inventory/category_subcategories';
import { getUniqueCategorySubcategoryProduct, removeProductFromCategorySubcategory } from 'models/inventory/category_subcategory_products';
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
        res.setHeader('Allow', 'DELETE');
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

// Remove a product from a category's subcategory 
async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category_subcategory_product", "delete");

    const category_subcategory_id = validateWithSchema(categorySubcategoryIdSchema, req.query._category_subcategory_id);
    const category_subcategory_product_id = validateWithSchema(productIdSchema, req.body.productId);

    const categorySubcategory = await getUniqueCategorySubcategory(user.team.id, category_subcategory_id);
    if (!categorySubcategory) return res.status(404).json({message: "category subcategory id not found"});

    if (!await getUniqueCategorySubcategoryProduct(user.team.id, category_subcategory_product_id))
        return res.status(404).json({message: `product id not found in `})

    await removeProductFromCategorySubcategory(user.team.id, category_subcategory_product_id);

    return res.status(201).json({message: `product successfully removed from '${categorySubcategory.category.name}' -> '${categorySubcategory.subcategory.name}'`})
}
