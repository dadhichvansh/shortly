import { z } from "zod";

export const userLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must be no more than 100 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(20, { message: "Password must be no more than 20 characters." }),
});

export const userRegistrationSchema = userLoginSchema.extend({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name must be no more than 100 characters." }),
});

export const shortenerSchema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL." })
    .min(1, { message: "URL is required." })
    .max(2048, { message: "URL is too long." }),
  shortCode: z
    .string()
    .trim()
    .min(3, { message: "Short code must be at least 3 characters long." })
    .max(20, { message: "Short code must be no more than 20 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Short code can only contain letters, numbers, underscores, and hyphens.",
    }),
});
