import { z } from "zod";

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  createdAt: z.date(),
  usageLimit: z.number().default(100), // Scalability: limit free users
});

export type UserProfile = z.infer<typeof UserSchema>;