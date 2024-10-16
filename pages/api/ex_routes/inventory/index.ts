import { validateWithSchema } from '@/lib/zod';
import { categoryIdSchema } from '@/lib/zod/inventory/category.schema';
import { categorySubcategoryIdArraySchema } from '@/lib/zod/inventory/category_subcategory.schema';
import { inventoryProductSchema } from '@/lib/zod/inventory/product.schema';
import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { addProductToCategory } from 'models/inventory/category_products';
import { getManyCategorySubcategories } from 'models/inventory/category_subcategories';
import { createManyCategory_SubCategory_Product } from 'models/inventory/category_subcategory_products';
import { createInventoryProduct, getAllInventoryProducts, getInventoryProductByCode } from 'models/inventory/products';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiKey } from "models/apiKey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { apiKey } = req.query;

  try {
    switch (req.method) {
      case "GET":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handleGET(req, res, apiKey);
        break;
      case "POST":
        if (!apiKey || typeof apiKey !== "string") {
          return res.status(400).json({
            error: { message: "apiKey is required and must be a string" },
          });
        }
        await handlePOST(req, res, apiKey);
        break;
      default:
        res.setHeader("Allow", "GET, POST, DELETE, PATCH");
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    const message = error.message || "Something went wrong";
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}

// return all products
async function handleGET( req: NextApiRequest,
    res: NextApiResponse,
    apiKey: string
) {
    const apiKeyData = await getApiKey(apiKey); 

    if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;
    
    const where = {};

    const inventoryProducts = await getAllInventoryProducts(teamId, where);

    return res.status(200).json({inventoryProducts});
}

// create a product
async function handlePOST(req: NextApiRequest,
  res: NextApiResponse,
  apiKey: string) 
  {
    // pre-condition: a post must be part created as a category child. And optionally as a sub-category child
    const apiKeyData = await getApiKey(apiKey); 

    if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;

    if (!req.body.product) return res.status(422).json({message: "Request Body is missing 'product' field."});
    if (!req.body.categoryId) return res.status(422).json({message: "Request Body is missing fields: missing 'categoryId'."})
        
    const product = validateWithSchema(inventoryProductSchema, req.body.product);
    const categoryId = validateWithSchema(categoryIdSchema, req.body.categoryId)

    if (product.code && await getInventoryProductByCode(product.code, teamId)) return res.status(403).json( {message: "Product code already registered"});
    
    const category = await getUniqueInventoryCategory(teamId, req.body.categoryId);
    if (!category) return res.status(404).json({message: "category id not found"});

    const newProduct = await createInventoryProduct(product, teamId);
    const categoryProduct = await addProductToCategory({
        teamId: teamId,
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

        if (!await getManyCategorySubcategories(teamId, category_subcategories)) return res.status(404).json({message: `subcategory id not found in '${category.name}'`});

        const datamap = category_subcategories.map((sub: string) => ({
            teamId: teamId,
            category_product_id: categoryProduct.id,
            category_subcategory_id: sub 
        }))

        const categorySubcategoriesProducts = await createManyCategory_SubCategory_Product(datamap);
        returnValue["category_subcategories_product"] = categorySubcategoriesProducts;
    }

    return res.status(200).json(returnValue);
}
