// Route for products in a category 
//

import { validateWithSchema } from '@/lib/zod';
import { categoryIdSchema } from '@/lib/zod/inventory/category.schema';
import { postCategory_productSchema } from '@/lib/zod/inventory/category_product.schema';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { addProductToCategory, getAllCategoryProducts, productAlreadyInCategory } from 'models/inventory/category_products';
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

// Return all products registered into a category
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    const categoryId = validateWithSchema(categoryIdSchema, req.query._categoryId);
    if (!await getUniqueInventoryCategory(user.team.id, categoryId))
        return res.status(404).json({message: "Category Id not found"});
    
    // TODO check if category id is in database
    const categoryProducts = await getAllCategoryProducts(user.team.id, categoryId);
    return res.status(200).json({categoryProducts});
}

// Add a Product into a category
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_category_product", "create");

    const { productId } = validateWithSchema(postCategory_productSchema, req.body);
    const categoryId = validateWithSchema(z.string().uuid(), req.query._categoryId);

    // check if this product id is already in that category
    if (await productAlreadyInCategory({
        teamId: user.team.id, productId, categoryId
    })) return res.status(403).json({message: "Product already registered in that category"});

    const category_product = await addProductToCategory({
        teamId: user.team.id,
        productId, categoryId 
    });

    
    return res.status(200).json({
        message: "product registered to category successfully", 
        category_product_id: category_product.id,
        product: category_product.product,
        category: category_product.category
    });
}
