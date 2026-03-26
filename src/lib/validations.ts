import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or less"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or less"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or less"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const freeEntrySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  image: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
})

export const storeRedemptionSchema = z.object({
  storeItemId: z
    .string()
    .min(1, "Store item ID is required"),
})

export const triviaAnswerSchema = z.object({
  questionId: z
    .string()
    .min(1, "Question ID is required"),
  answer: z
    .string()
    .min(1, "Answer is required"),
})

export const pollVoteSchema = z.object({
  pollId: z
    .string()
    .min(1, "Poll ID is required"),
  optionId: z
    .string()
    .min(1, "Option ID is required"),
})

// Type exports for convenience
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type FreeEntryInput = z.infer<typeof freeEntrySchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type StoreRedemptionInput = z.infer<typeof storeRedemptionSchema>
export type TriviaAnswerInput = z.infer<typeof triviaAnswerSchema>
export type PollVoteInput = z.infer<typeof pollVoteSchema>
