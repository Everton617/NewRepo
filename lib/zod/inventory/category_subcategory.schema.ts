import { z } from "zod";

export const postCategorySubcategorySchema = z.object({
    subCategoryId: z.string()
});

export const categorySubcategoryIdSchema = z.string().uuid();

export const categorySubcategoryIdArraySchema = z.array(categorySubcategoryIdSchema);
