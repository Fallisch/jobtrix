import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const profileSchema = z.object({
  name: z.string().max(255),
  address: z.string().max(500),
  email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().max(50),
  birthdate: z.string().max(20),
  photo: z.string().nullable().optional(),
  education: z.array(z.any()),
  experience: z.array(z.any()),
  qualifications: z.array(z.any()),
  interests: z.array(z.any()),
});
