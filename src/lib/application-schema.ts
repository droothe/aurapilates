import { z } from "zod";

/** Turkish mobile/landline: 10–13 digits once spaces, dashes, parentheses and + are removed. */
export const phonePattern = /^\+?[0-9\s()-]{10,20}$/;

export const applicationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Lütfen adınızı ve soyadınızı yazın" })
    .max(100, { message: "En fazla 100 karakter" }),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, { message: "Geçerli bir telefon numarası girin" })
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 10 && digits <= 13;
    }, { message: "Geçerli bir telefon numarası girin" }),
  course: z
    .string()
    .trim()
    .min(2, { message: "Lütfen bir eğitim veya ders seçin" })
    .max(150),
  training_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(1000, { message: "En fazla 1000 karakter" }).optional().default(""),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
