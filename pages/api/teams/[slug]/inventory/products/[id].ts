import { validateWithSchema } from '@/lib/zod';
import { patchInventoryProductSchema, productIdSchema } from '@/lib/zod/inventory/product.schema';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { addProductToCategory, deleteCategoryProductByProductId } from 'models/inventory/category_products';
import { getManyCategorySubcategories } from 'models/inventory/category_subcategories';
import { createManyCategory_SubCategory_Product } from 'models/inventory/category_subcategory_products';
import { createInventoryProduct, deleteInventoryProduct, getInventoryProductByCode, getInventoryProductById, updateInventoryProduct } from 'models/inventory/products';
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
      case 'PATCH': 
        await handlePATCH(req, res);
        break;
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

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_product", "read");
    
    if (!req.query.id) return res.status(422).json({message: "missing query parameter: missing 'id'"})
    const prodId = req.query.id as string;
    const product = await getInventoryProductById(prodId, user.team.id)
    if (!product) return res.status(404).json({message: "product id not found"});
    return res.status(200).json({product});
}

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_product", "update");
    
    if (!req.query.id) return res.status(422).json({message: "missing query parameter: missing 'id'"});

    const id = validateWithSchema(z.string().uuid(), req.query.id);
    if (!await getInventoryProductById(id, user.team.id)) return res.status(404).json({message: "product id not found"});

    validateWithSchema(patchInventoryProductSchema, req.body);

    if (req.body.code) {
      const productByCode = await getInventoryProductByCode(req.body.code, user.team.id);
      
      if (productByCode && productByCode.id !== id) return res.status(403).json({message: "Product code already registered"});
      if (productByCode && productByCode.code === req.body.code ) delete req.body.code;
    } 
    
    const returnValue = {};
    let categoryProduct: any | undefined = undefined;
    if (req.body.categoryId) {
      if (!await getUniqueInventoryCategory(user.team.id, req.body.categoryId)) return res.status(404).json({message: "category id not found"});

      // delete/remove this product from its previous category
      await deleteCategoryProductByProductId(user.team.id, req.query.id as string);
      categoryProduct = await addProductToCategory({
        teamId: user.team.id,
        productId: req.query.id as string,
        categoryId: req.body.categoryId
      })
      returnValue["category_product"] = categoryProduct;
    }

    if (req.body.category_subcategories && categoryProduct) {
      const category_subcategories = req.body.category_subcategories;
      if (!await getManyCategorySubcategories(user.team.id, category_subcategories))
        return res.status(404).json({message: "subcategories id's not found"});
      
      const datamap = category_subcategories.map((sub: string) => ({
        teamId: user.team.id,
        category_product_id: categoryProduct.id,
        category_subcategory_id: sub
      }));

      returnValue["category_subcategories_product"] = await createManyCategory_SubCategory_Product(datamap);
    }

    delete req.body.categoryId;
    delete req.body.category_subcategories;

    returnValue["product"] = await updateInventoryProduct(id, user.team.id, req.body);
    returnValue["message"] = "product updated successfully";

    return res.status(200).json(returnValue);
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, "team_inventory_product", "delete");
    
    if (!req.query.id) return res.status(422).json({message: "missing query parameter: missing 'id'"}); 

    const id = validateWithSchema(productIdSchema, req.query.id);
    if (!await getInventoryProductById(id, user.team.id)) return res.status(404).json({message: "product id not found"}) ;
    await deleteInventoryProduct(id, user.team.id);
    
    return res.status(200).json({
        message: "product deleted successfully",
    });
}
