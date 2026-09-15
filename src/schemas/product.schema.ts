import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    category: z.string().trim().min(1, 'Category is required'),
    price: z.number().int('Price must be an integer').positive('Price must be a positive value'),
    stock: z.number().int('Stock must be an integer').nonnegative('Stock must be a non-negative integer'),
    description: z.string().trim().nullable().optional(),
    imageUrl: z.url('Invalid image URL format').nullable().optional(),
    availableUntil: z.iso.datetime({ message: 'Must be a valid ISO 8601 timestamp' }).nullable().optional()
});

export const CreateProductSchema = ProductSchema;

export const UpdateProductSchema = ProductSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided to update' }
);

export const ProductQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
});

export const ProductDbSchema = ProductSchema.extend({
    id: z.uuid({ version: 'v4' }),
    createdAt: z.iso.datetime()
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type Product = z.infer<typeof ProductDbSchema>;
