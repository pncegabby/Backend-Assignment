import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
    CreateProductSchema,
    UpdateProductSchema,
    ProductQuerySchema
} from '../schemas/product.schema.js';
import * as productService from '../services/product.service.js';

/**
 * Controller handler for fetching all products or paginated product records.
 * 
 * @param req - Express request with optional query params `page` and `limit`.
 * @param res - Express response returning the product list or paginated payload.
 * @param next - Express next middleware function for error propagation.
 */
export function getProducts(req: Request, res: Response, next: NextFunction): void {
    try {
        const queryResult = ProductQuerySchema.safeParse(req.query);

        if (!queryResult.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid pagination query parameters: "page" and "limit" must be positive integers (limit max 100).',
                errors: z.flattenError(queryResult.error)
            });
            return;
        }

        const { page, limit } = queryResult.data;

        if (page !== undefined || limit !== undefined) {
            const currentPage = page ?? 1;
            const currentLimit = limit ?? 10;
            const result = productService.getPaginatedProducts(currentPage, currentLimit);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
            return;
        }

        const products = productService.getAllProducts();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

export function getProductById(req: Request, res: Response, next: NextFunction): void {
    try {
        const id = req.params.id;

        if (!id || typeof id !== 'string') {
            res.status(400).json({
                success: false,
                message: "Product ID parameter is required."
            });
            return;
        }

        const product = productService.getProductById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: `Product with ID "${id}" was not found in the inventory.`
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
}

export function createProduct(req: Request, res: Response, next: NextFunction): void {
    try {
        const result = CreateProductSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed: Please ensure all required fields (name, category, price, stock) are valid.',
                errors: z.flattenError(result.error)
            });
            return;
        }

        const createdProduct = productService.createProduct(result.data);
        res.status(201).json({
            success: true,
            data: createdProduct
        });
    } catch (error) {
        next(error);
    }
}

export function updateProduct(req: Request, res: Response, next: NextFunction): void {
    try {
        const { id } = req.params;
        const result = UpdateProductSchema.safeParse(req.body);

        if (!id || typeof id !== 'string') {
            res.status(400).json({
                success: false,
                message: "Product ID parameter is required."
            });
            return;
        }

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed: Invalid update payload. At least one valid field must be provided to update.',
                errors: z.flattenError(result.error)
            });
            return;
        }

        const updatedProduct = productService.updateProduct(id, result.data);

        if (!updatedProduct) {
            res.status(404).json({
                success: false,
                message: `Product with ID "${id}" could not be found to update.`
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        next(error);
    }
}

export function deleteProduct(req: Request, res: Response, next: NextFunction): void {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            res.status(400).json({
                success: false,
                message: "Product ID parameter is required."
            });
            return;
        }

        const deleted = productService.deleteProduct(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: `Product with ID "${id}" cannot be found to delete.`
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
}
