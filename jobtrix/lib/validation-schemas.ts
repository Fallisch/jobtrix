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

const educationEntrySchema = z.object({
  id: z.string().max(100),
  degree: z.string().max(500),
  institution: z.string().max(500),
  year: z.string().max(20),
}).passthrough();

const experienceEntrySchema = z.object({
  id: z.string().max(100),
  position: z.string().max(500),
  company: z.string().max(500),
  period: z.string().max(100),
  tasks: z.string().max(5000),
}).passthrough();

const skillItemSchema = z.object({
  label: z.string().max(500),
  value: z.number(),
}).passthrough();

export const profileSchema = z.object({
  name: z.string().max(255),
  address: z.string().max(500).default(""),
  email: z.union([z.literal(""), z.string().email()]).default(""),
  phone: z.string().max(50).default(""),
  birthdate: z.string().max(20).default(""),
  photo: z.string().max(500_000).nullable().optional(),
  education: z.array(educationEntrySchema).max(50),
  experience: z.array(experienceEntrySchema).max(50),
  qualifications: z.array(skillItemSchema).max(50),
  interests: z.array(skillItemSchema).max(50),
});

export const generateRequestSchema = z.object({
  jobPosting: z.string().max(50_000),
  jobTitle: z.string().max(500).optional(),
  companyName: z.string().max(500).optional(),
  contactPerson: z.string().max(500).optional(),
  profile: profileSchema,
  cvStyle: z.enum(["classic", "american"]).optional(),
  template: z.enum(["classic", "modern", "traditional", "accent", "creative"]).optional(),
  accentColor: z.string().max(20).optional(),
  isInitiativbewerbung: z.boolean().optional(),
  targetCompany: z.string().max(500).optional(),
  workMode: z.enum(["remote", "homeoffice", "hybrid", "onsite"]).optional(),
});

export const sendEmailSchema = z.object({
  to: z.string().email().max(320),
  subject: z.string().max(1000),
  body: z.string().max(10_000),
  coverLetter: z.string().max(50_000),
  cv: z.string().max(50_000),
  profile: profileSchema,
  template: z.enum(["classic", "modern", "traditional", "accent", "creative"]),
  cvStyle: z.enum(["classic", "american"]),
  accentColor: z.string().max(20).optional(),
});
