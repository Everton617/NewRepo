import { validateWithSchema } from '@/lib/zod';


import { getUniqueInventoryCategory } from 'models/inventory/categories';
import { createCategorySubcategory, subcategoryAlreadyInCategory } from 'models/inventory/category_subcategories';
import { getUniqueInventorySubCategory } from 'models/inventory/subcategories';


import type { NextApiRequest, NextApiResponse } from 'next';

import { getApiKey } from "models/apiKey";
import { z } from 'zod';



// Define um esquema de validação para o ID da categoria
const categoryIdSchema = z.string().uuid();
const subCategoryIdSchema = z.string()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { apiKey } = req.query;

  try {
    switch (req.method) {
     
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



// Create a category subcategory
async function handlePOST(req: NextApiRequest,
    res: NextApiResponse,
    apiKey: string) {

    const apiKeyData = await getApiKey(apiKey); 

    if (!apiKeyData) {
        return res.status(401).json({ error: { message: "Invalid API key" } });
      }
  
      const { teamId } = apiKeyData;


      const validatedCategoryId = categoryIdSchema.parse(req.query.categoryId);
      const { subCategoryId } = req.body; // Extrair o campo subCategoryId
      const validatedSubCategoryId = validateWithSchema(subCategoryIdSchema, subCategoryId); 

    // check if category id exist
    const category = await getUniqueInventoryCategory(teamId, validatedCategoryId);
    if (!category) return res.status(404).json({message: "category id not found"});
    
    // check if subcategory id exist
    const subcategory = await getUniqueInventorySubCategory(teamId, validatedSubCategoryId);
    if (!subcategory) return res.status(404).json({message: "subcategory id not found"});

    // check if subcategory is already registered in that category
    if (await subcategoryAlreadyInCategory({teamId: teamId, categoryId:validatedCategoryId, subCategoryId:validatedSubCategoryId})) 
        return res.status(403).json({message: `subcategory is already registered in ${category.name}`})

    const category_subcategory = await createCategorySubcategory({
        teamId: teamId,
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




