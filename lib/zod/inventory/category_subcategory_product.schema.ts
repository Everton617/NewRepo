import { z } from "zod";

export const res_Category_Subcategory_Product_Schema = z.object({
    id: z.string().uuid(),
    createdAt: z.string().date(),
    category_subcategory: z.object({
        id: z.string().uuid(),
        createdAt: z.string().date(),
        subcategory: z.object({
            id: z.string().uuid(),
            name: z.string(),
            createdAt: z.string().date()
        })
    })
});
