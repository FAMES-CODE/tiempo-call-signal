import * as z from "zod";

export const FormSheetSchema = z
  .object({
    status: z.string().nullable(),
    problemType: z.string().nullable(),
    problemDescription: z.string().nullable(),
    callSim: z.string().nullable(),
    callNumber: z.string().nullable(),
    user: z
      .object({
        connect: z
          .object({
            id: z.number().int().positive(),
          })
          .nullable(),
      })
      .nullable(),
    createdById: z.number().int().positive(),
    customer: z
      .object({
        connect: z
          .object({
            id: z.number().int().positive(),
          })
          .nullable(),
      })
      .nullable(),
    customerId: z.number().int().positive(),
    observation: z.string().nullable(),
    resolvedAt: z.date().nullable(),
    resolvedBy: z
      .object({
        connect: z
          .object({
            id: z.number().int().positive(),
          })
          .nullable(),
      })
      .nullable(),
    resolvedById: z.number().int().positive().nullable(),
    isSynced: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.createdAt <= data.updatedAt, {
    message: "Updated at date cannot be before created at date",
    path: ["updatedAt"],
  });

export type FormSheetT = z.infer<typeof FormSheetSchema>;
