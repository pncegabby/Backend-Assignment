import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import db from '../config/db.js';

describe('Product Routes & Integration Tests', () => {
    beforeEach(() => {
        db.prepare('DELETE FROM products').run();
    });

    describe('POST /api/products', () => {
        it('should create a new product successfully with 201 status', async () => {
            const newProductPayload = {
                name: 'LSCS Classic Jacket',
                description: 'Varsity jacket for LSCS members',
                price: 120000,
                stock: 30,
                category: 'Clothing',
                imageUrl: 'https://example.com/jacket.jpg',
                availableUntil: '2026-12-31T23:59:59.000Z'
            };

            const response = await request(app)
                .post('/api/products')
                .send(newProductPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                name: newProductPayload.name,
                description: newProductPayload.description,
                price: newProductPayload.price,
                stock: newProductPayload.stock,
                category: newProductPayload.category,
                imageUrl: newProductPayload.imageUrl,
                availableUntil: newProductPayload.availableUntil
            });
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.createdAt).toBeDefined();
        });

        it('should create a product with optional/custom attributes as null when omitted', async () => {
            const minimalPayload = {
                name: 'Basic LSCS Sticker',
                price: 5000,
                stock: 100,
                category: 'Accessories'
            };

            const response = await request(app)
                .post('/api/products')
                .send(minimalPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(minimalPayload.name);
            expect(response.body.data.description).toBeNull();
            expect(response.body.data.imageUrl).toBeNull();
            expect(response.body.data.availableUntil).toBeNull();
        });

        it('should return 400 Bad Request when required fields are missing', async () => {
            const incompletePayload = {
                description: 'Missing name, price, stock, category'
            };

            const response = await request(app)
                .post('/api/products')
                .send(incompletePayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation failed');
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors.fieldErrors.name).toBeDefined();
            expect(response.body.errors.fieldErrors.price).toBeDefined();
            expect(response.body.errors.fieldErrors.stock).toBeDefined();
            expect(response.body.errors.fieldErrors.category).toBeDefined();
        });

        it('should return 400 Bad Request when price is negative', async () => {
            const invalidPricePayload = {
                name: 'Free Item',
                price: -500,
                stock: 10,
                category: 'Clothing'
            };

            const response = await request(app)
                .post('/api/products')
                .send(invalidPricePayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors.fieldErrors.price).toBeDefined();
        });

        it('should return 400 Bad Request when stock is negative', async () => {
            const invalidStockPayload = {
                name: 'Negative Stock Item',
                price: 1500,
                stock: -1,
                category: 'Clothing'
            };

            const response = await request(app)
                .post('/api/products')
                .send(invalidStockPayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors.fieldErrors.stock).toBeDefined();
        });

        it('should return 400 Bad Request on invalid imageUrl format', async () => {
            const invalidUrlPayload = {
                name: 'Invalid URL Item',
                price: 2000,
                stock: 5,
                category: 'Accessories',
                imageUrl: 'not-a-valid-url'
            };

            const response = await request(app)
                .post('/api/products')
                .send(invalidUrlPayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors.fieldErrors.imageUrl).toBeDefined();
        });

        it('should return 400 Bad Request on invalid availableUntil datetime', async () => {
            const invalidDatePayload = {
                name: 'Invalid Date Item',
                price: 2000,
                stock: 5,
                category: 'Accessories',
                availableUntil: 'invalid-date-string'
            };

            const response = await request(app)
                .post('/api/products')
                .send(invalidDatePayload);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors.fieldErrors.availableUntil).toBeDefined();
        });
    });

    describe('GET /api/products', () => {
        it('should return 200 OK with an empty array when no products exist', async () => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        it('should return 200 OK with an array of products', async () => {
            await request(app).post('/api/products').send({
                name: 'Product 1',
                price: 1000,
                stock: 10,
                category: 'Category A'
            });

            await request(app).post('/api/products').send({
                name: 'Product 2',
                price: 2000,
                stock: 20,
                category: 'Category B'
            });

            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });

        it('should support pagination with page and limit query params', async () => {
            for (let i = 1; i <= 3; i++) {
                await request(app).post('/api/products').send({
                    name: `Product ${i}`,
                    price: 1000 * i,
                    stock: 5 * i,
                    category: 'Test'
                });
            }

            const response = await request(app).get('/api/products?page=1&limit=2');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
            expect(response.body.pagination).toEqual({
                page: 1,
                limit: 2,
                totalItems: 3,
                totalPages: 2
            });
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return 200 OK with the product when found', async () => {
            const createRes = await request(app).post('/api/products').send({
                name: 'LSCS Pen',
                price: 500,
                stock: 100,
                category: 'Stationery'
            });

            const productId = createRes.body.data.id;

            const response = await request(app).get(`/api/products/${productId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(productId);
            expect(response.body.data.name).toBe('LSCS Pen');
        });

        it('should return 404 Not Found when product does not exist', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app).get(`/api/products/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update existing product attributes and return 200 OK', async () => {
            const createRes = await request(app).post('/api/products').send({
                name: 'Original Hoodie',
                price: 80000,
                stock: 20,
                category: 'Clothing'
            });

            const productId = createRes.body.data.id;

            const updateRes = await request(app)
                .put(`/api/products/${productId}`)
                .send({
                    price: 75000,
                    stock: 15,
                    description: 'Updated discounted price'
                });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.success).toBe(true);
            expect(updateRes.body.data.price).toBe(75000);
            expect(updateRes.body.data.stock).toBe(15);
            expect(updateRes.body.data.description).toBe('Updated discounted price');
            expect(updateRes.body.data.name).toBe('Original Hoodie');
        });

        it('should return 404 Not Found when updating a non-existent product', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app)
                .put(`/api/products/${nonExistentId}`)
                .send({ price: 9000 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('could not be found');
        });

        it('should return 400 Bad Request when update payload is empty', async () => {
            const createRes = await request(app).post('/api/products').send({
                name: 'Test Item',
                price: 1000,
                stock: 10,
                category: 'Test'
            });

            const productId = createRes.body.data.id;

            const response = await request(app)
                .put(`/api/products/${productId}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 Bad Request when update payload has invalid values', async () => {
            const createRes = await request(app).post('/api/products').send({
                name: 'Test Item',
                price: 1000,
                stock: 10,
                category: 'Test'
            });

            const productId = createRes.body.data.id;

            const response = await request(app)
                .put(`/api/products/${productId}`)
                .send({
                    price: -100
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete an existing product and return 200 OK', async () => {
            const createRes = await request(app).post('/api/products').send({
                name: 'Temporary Item',
                price: 1000,
                stock: 5,
                category: 'Temporary'
            });

            const productId = createRes.body.data.id;

            const deleteRes = await request(app).delete(`/api/products/${productId}`);

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body.success).toBe(true);
            expect(deleteRes.body.message).toBe('Product deleted successfully.');

            const getRes = await request(app).get(`/api/products/${productId}`);
            expect(getRes.status).toBe(404);
        });

        it('should return 404 Not Found when deleting non-existent product', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const response = await request(app).delete(`/api/products/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('cannot be found');
        });
    });
});
