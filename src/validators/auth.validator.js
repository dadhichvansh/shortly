import { z } from 'zod';

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: 'Name must be at least 3 characters long.' })
  .max(100, { message: 'Name must be no more than 100 characters.' });

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Please enter a valid email address.' })
  .max(100, { message: 'Email must be no more than 100 characters.' });

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(20, { message: 'Password must be no more than 20 characters.' }),
});

export const userRegistrationSchema = userLoginSchema.extend({
  name: nameSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().length(8),
  email: z.string().trim().email(),
});

export const verifyUserSchema = z.object({
  name: nameSchema,
});

export const verifyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current Password is required!' }),
    newPassword: z
      .string()
      .min(6, { message: 'New Password must be at least 6 characters long.' })
      .max(20, {
        message: 'New Password must be no more than 20 characters.',
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: 'Confirm Password must be at least 6 characters long.',
      })
      .max(20, {
        message: 'Confirm Password must be no more than 20 characters.',
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: 'New Password must be at least 6 characters long.' })
      .max(20, {
        message: 'New Password must be no more than 20 characters.',
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: 'Confirm Password must be at least 6 characters long.',
      })
      .max(20, {
        message: 'Confirm Password must be no more than 20 characters.',
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
