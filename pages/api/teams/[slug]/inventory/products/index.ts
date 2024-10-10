import { validateWithSchema } from '@/lib/zod';
import { categoryIdSchema } from '@/lib/zod/inventory/category.schema';
import { categorySubcategoryIdArraySchema } from '@/lib/zod/inventory/category_subcategory.schema';
import { inventoryProductSchema } from '@/lib/zod/inventory/product.schema';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { addProductToCategory } from 'models/inventory/category_products';
import { getManyCategorySubcategories } from 'models/inventory/category_subcategories';
import { createManyCategory_SubCategory_Product } from 'models/inventory/category_subcategory_products';
import { createInventoryProduct, getAllInventoryProducts, getInventoryProductByCode } from 'models/inventory/products';
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

// return all products
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_product", "read");
    
    const where = {};
    if (req.query.name) where["name"] = {contains: req.query.name};
    if (req.query.code) where["code"] = {contains: req.query.code};

    const inventoryProducts = await getAllInventoryProducts(user.team.id, where);

    return res.status(200).json({inventoryProducts});
}

// create a product
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
    // pre-condition: a post must be part created as a category child. And optionally as a sub-category child
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_product", "create");

    if (!req.body.product) return res.status(422).json({message: "Request Body is missing 'product' field."});
    if (!req.body.categoryId) return res.status(422).json({message: "Request Body is missing fields: missing 'categoryId'."})
        
    const product = validateWithSchema(inventoryProductSchema, req.body.product);
    const categoryId = validateWithSchema(categoryIdSchema, req.body.categoryId)

    if (product.code && await getInventoryProductByCode(product.code, user.team.id)) return res.status(403).json( {message: "Product code already registered"});
    
    const category = await getUniqueInventoryCategory(user.team.id, req.body.categoryId);
    if (!category) return res.status(404).json({message: "category id not found"});

    const newProduct = await createInventoryProduct(product, user.team.id);
    const categoryProduct = await addProductToCategory({
        teamId: user.team.id,
        productId: newProduct.id,
        categoryId: categoryId,
    });

    const returnValue = {
        message: "product created successfully",
        product: newProduct,
        category_product: categoryProduct,
    };
    
    // prevent user from passing invalids or non existent subcategory ids.
    if (req.body.category_subcategories) {

        const category_subcategories = validateWithSchema(categorySubcategoryIdArraySchema, req.body.category_subcategories);

        if (!await getManyCategorySubcategories(user.team.id, category_subcategories)) return res.status(404).json({message: `subcategory id not found in '${category.name}'`});

        const datamap = category_subcategories.map((sub: string) => ({
            teamId: user.team.id,
            category_product_id: categoryProduct.id,
            category_subcategory_id: sub 
        }))

        const categorySubcategoriesProducts = await createManyCategory_SubCategory_Product(datamap);
        returnValue["category_subcategories_product"] = categorySubcategoriesProducts;
    }

    return res.status(200).json(returnValue);
}
