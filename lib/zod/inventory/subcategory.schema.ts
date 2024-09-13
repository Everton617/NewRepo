import { z } from "zod";

export const postSubCategorySchema = z.object({
    name: z.string()
});

export const subCategoryIdSchema = z.string().uuid();

export const subCategoryIdArraySchema = z.array(subCategoryIdSchema);
