import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.enum(["supporter", "organization"]),
  organizationName: z.string().optional(),
  organizationMission: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const organizationApplicationSchema = z.object({
  legalName: z.string().min(3),
  displayName: z.string().min(2),
  description: z.string().min(20),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email(),
});

export const childProfileSchema = z.object({
  alias_name: z.string().min(2),
  age_range: z.string().min(3),
  talents: z.string().min(5),
  story_summary: z.string().min(20),
});

export const contentSchema = z.object({
  title: z.string().min(4),
  summary: z.string().min(12),
  amount_needed: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const updateSchema = z.object({
  title: z.string().min(4),
  details: z.string().min(20),
});
