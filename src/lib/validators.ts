import { z } from "zod";
import { GOVERNORATES } from "./constants";
export const TN_PHONE = /^(\+216|00216)?[\s-]?[2-579]\d{1}[\s-]?\d{3}[\s-]?\d{3}$/;
export const passwordRule = z.string().min(8, "8 caractères minimum").regex(/[A-Z]/, "Une majuscule requise").regex(/[0-9]/, "Un chiffre requis");
export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  dateOfBirth: z.string().refine((v) => { const d = new Date(v); if (isNaN(+d)) return false; const age = (Date.now() - +d) / 31557600000; return age >= 18 && age < 120; }, "Vous devez avoir 18 ans ou plus"),
  phone: z.string().trim().regex(TN_PHONE, "Numéro tunisien invalide (ex: 22 345 678)"),
  governorate: z.enum(GOVERNORATES as [string, ...string[]], { message: "Gouvernorat requis" }),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: passwordRule,
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions et la politique de confidentialité" }) }),
}).refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Les mots de passe ne correspondent pas" });
export type RegisterInput = z.infer<typeof registerSchema>;
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const moodSchema = z.object({ mood: z.string().min(1), intensity: z.coerce.number().int().min(1).max(10), note: z.string().max(1000).optional() });
export const journalSchema = z.object({ title: z.string().trim().min(1, "Titre requis").max(120), content: z.string().trim().min(1).max(20000), mood: z.string().optional(), emotions: z.array(z.string()).default([]), tags: z.array(z.string()).default([]) });
export const assistantSchema = z.object({ message: z.string().trim().min(1).max(500), conversationId: z.string().optional() });
