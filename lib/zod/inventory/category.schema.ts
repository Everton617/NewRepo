import { z } from "zod";

export const postCategorySchema = z.object({
    name: z.string(),
});

export const categoryIdSchema = z.string().uuid();
