import * as z from "zod";

export const FormSheetSchema = z.object({
  status: z.string().optional(),
  problemType: z.string().optional(),
  problemDescription: z.string().optional(),
  callSim: z.string().optional(),
  callNumber: z.string().optional(),
  customerId: z.number().int().positive(),
  observation: z.string().optional(),
});

export type FormSheetT = z.infer<typeof FormSheetSchema>;
