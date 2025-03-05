import z from 'zod';
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' });

export const loginSchema = z.object({
  username: z.string(),
  password: passwordSchema,
});

export const registerSchema = z.object({
  username: z.string(),
  name: z.string(),
  whatsapp: z
    .string()
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    })
    .refine((val) => val !== null, { message: 'Invalid WhatsApp number' }),

  password: passwordSchema,
});
export type loginAuth = z.infer<typeof loginSchema>;
export type RegisterAuth = z.infer<typeof registerSchema>;
