import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const addRunFormSchema = z.object({
    date: z.string().optional(),
    locationText: z
        .string()
        .min(1, 'Location is required')
        .max(100, 'Location must be less than 100 characters'),
    distanceKm: z
        .number()
        .min(0.01, 'Distance must be at least 0.01 km')
        .max(999.99, 'Distance must be less than 1000 km'),
    durationMinutes: z
        .number()
        .min(1, 'Duration must be at least 1 minute')
        .max(999, 'Duration must be less than 1000 minutes'),
    photoUrl: z.string().optional(),
});

export const addRunSchema = z.object({
    date: z.string().optional(),
    locationText: z
        .string()
        .min(1, 'Location is required')
        .max(100, 'Location must be less than 100 characters'),
    distanceKm: z
        .number()
        .min(0.01, 'Distance must be at least 0.01 km')
        .max(999.99, 'Distance must be less than 1000 km'),
    durationMinutes: z
        .number()
        .min(1, 'Duration must be at least 1 minute')
        .max(999, 'Duration must be less than 1000 minutes'),
    photoUrl: z.string().optional(),
});

export type AddRunFormData = z.infer<typeof addRunFormSchema>;
export type AddRunData = z.infer<typeof addRunSchema>;
