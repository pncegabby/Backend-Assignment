import crypto from 'node:crypto';
import db from '../config/db.js';
import type { PaginatedResult } from '../types.js';
import type { Product, ProductInput, UpdateProductInput } from '../schemas/product.schema.js';


export function getAllProducts(): Product[] {
    const statement = db.prepare(/* sql */ `
        SELECT * FROM products
        ORDER BY createdAt DESC
    `);
    return statement.all() as Product[];
}

export function getPaginatedProducts(page: number, limit: number): PaginatedResult<Product> {
    const offset = (page - 1) * limit;

    const countStmt = db.prepare(/* sql */ `
        SELECT COUNT(*) as total FROM products
    `);
    const totalResult = (countStmt.get() as { total: number }) || { total: 0 };
    const totalItems = totalResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    const selectStmt = db.prepare(/* sql */ `
        SELECT * FROM products
        ORDER BY createdAt DESC
        LIMIT @limit OFFSET @offset
    `);

    const data = selectStmt.all({ limit, offset }) as Product[];

    return {
        data,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages
        }
    };
}

export function getProductById(id: string): Product | undefined {
    const statement = db.prepare(/* sql */ `
        SELECT * FROM products
        WHERE id = ?
    `);
    return statement.get(id) as Product | undefined;
}

export function createProduct(input: ProductInput): Product {
    const newProduct: Product = {
        id: crypto.randomUUID(),
        name: input.name,
        price: input.price,
        stock: input.stock,
        category: input.category,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        availableUntil: input.availableUntil ?? null,
        createdAt: new Date().toISOString()
    };

    const statement = db.prepare(/* sql */ `
        INSERT INTO products (
            id, name, description, category, price, stock, imageUrl, availableUntil, createdAt
        ) VALUES (
            @id, @name, @description, @category, @price, @stock, @imageUrl, @availableUntil, @createdAt
        )
    `);

    statement.run(newProduct);
    return newProduct;
}

export function updateProduct(id: string, input: UpdateProductInput): Product | null {
    const existing = getProductById(id);
    if (!existing) {
        return null;
    }

    const setClauses = Object.keys(input)
        .map((key) => `${key} = @${key}`)
        .join(', ');

    const updateStatement = db.prepare(/* sql */ `
        UPDATE products
        SET ${setClauses}
        WHERE id = @id
        RETURNING *
    `);

    return updateStatement.get({ ...input, id }) as Product;
}

export function deleteProduct(id: string): boolean {
    const result = db.prepare(/* sql */ `
        DELETE FROM products
        WHERE id = ?
    `).run(id);

    return result.changes > 0;
}
