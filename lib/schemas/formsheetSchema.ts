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


export const FormSheetFormSchema = z.object({
  problemType: z
    .string()
    .trim()
    .min(1, "Enter a problem type"),
  problemDescription: z
    .string()
    .trim()
    .min(1, "Describe the issue"),
  callSim: z.string().trim().min(1, "Choose a line"),
  callNumber: z.string().trim().min(1, "Enter the caller number"),
  customerId: z
    .number({ invalid_type_error: "Select a customer" })
    .int()
    .positive({ message: "Select a customer" }),
  observation: z.string().optional(),
});

export type FormSheetFormValues = z.infer<typeof FormSheetFormSchema>;
