import { z } from "zod";

export const newContactLabelSchema = z.object({
    labelId: z.string().uuid(),
    contactId: z.string().uuid()
});
