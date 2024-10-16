import { z } from "zod";

export const inventoryProductSchema = z.object({
    name: z.string(),
    imageUrl: z.string().optional(),
    code: z.string().optional(),
    description: z.string().optional(),

    purchasePrice: z.string().optional(),
    salePrice: z.string(),

    stockQuant: z.number(),
    unitOfMeasure: z.string().optional(),
    supplier: z.string().optional()
});

export const patchInventoryProductSchema = inventoryProductSchema.partial().extend({
  categoryId: z.string().uuid().optional(),
  category_subcategories: z.array(z.string().uuid()).optional()
});

export const arrayInventoryProductsSchema = z.array(inventoryProductSchema);

export const responseInvProductSchema = inventoryProductSchema.extend({
    id: z.string().uuid(),
    imageUrl: z.union([z.string(), z.null()]),
    code: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),

    unitOfMeasure: z.union([z.string(), z.null()]).optional(),
    supplier: z.union([z.string(), z.null()]).optional(),

    purchasePrice: z.union([z.string(), z.null()]).optional(),
})
export const responseArrayInvProductsSchema = z.array(responseInvProductSchema);
export const productIdSchema = z.string().uuid();