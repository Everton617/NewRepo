import { z } from "zod";

export const postCategory_productSchema = z.object({
    productId: z.string().uuid(),
    categoryId: z.string().uuid()
});

export const categoryProductIdSchema = z.string().uuid();

export const res_Category_Product_Schema = z.object({
    id: z.string().uuid(),
    createdAt: z.string().date(),
    category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        createdAt: z.string().date()
    })
});
