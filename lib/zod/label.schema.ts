import { z } from "zod";
export const newUniqueLabelSchema = z.object({
    labelId:z.string().optional(),
    name: z.string().optional(),
    emoji: z.string().optional(),
});

export const newLabelsSchema = z.array(newUniqueLabelSchema);
