import crypto from "node:crypto";
import db from "../src/config/db.js";
import type { Product } from "../src/schemas/product.schema.js";

/**
 * Sample merchandise items representing LSCS Macky Merch inventory.
 */
const mockProducts: Product[] = [
    {
        id: crypto.randomUUID(),
        name: "LSCS Macky Classic Hoodie",
        description: "Premium cotton hoodie featuring the 41st LSCS embroidered logo.",
        price: 85000, // 850.00 PHP in cents
        stock: 50,
        category: "Clothing",
        imageUrl: "https://example.com/images/macky-hoodie.jpg",
        availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
    },
    {
        id: crypto.randomUUID(),
        name: "LSCS Holographic Sticker Pack",
        description: "Waterproof vinyl holographic stickers for laptops and water bottles.",
        price: 15000, // 150.00 PHP in cents
        stock: 120,
        category: "Accessories",
        imageUrl: "https://example.com/images/stickers.jpg",
        availableUntil: null,
        createdAt: new Date().toISOString()
    },
    {
        id: crypto.randomUUID(),
        name: "Systems & Infra Enamel Pin",
        description: "Limited edition metal enamel pin for Systems & Infrastructure committee members.",
        price: 20000, // 200.00 PHP in cents
        stock: 25,
        category: "Accessories",
        imageUrl: "https://example.com/images/infra-pin.jpg",
        availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
    },
    {
        id: crypto.randomUUID(),
        name: "LSCS Signature Lanyard",
        description: "Double-sided satin lanyard with heavy-duty metal clasp and safety breakaway.",
        price: 12000, // 120.00 PHP in cents
        stock: 200,
        category: "Accessories",
        imageUrl: "https://example.com/images/lanyard.jpg",
        availableUntil: null,
        createdAt: new Date().toISOString()
    }
];

const insertSql = db.prepare(/* sql */ `
    INSERT INTO products (id, name, description, category, price, stock, imageUrl, availableUntil, createdAt)
    VALUES (@id, @name, @description, @category, @price, @stock, @imageUrl, @availableUntil, @createdAt)
`);

const seedDatabase = db.transaction((products: Product[]) => {
    db.exec(`DELETE FROM products;`);

    for (const product of products) {
        insertSql.run({
            ...product,
            description: product.description ?? null,
            imageUrl: product.imageUrl ?? null,
            availableUntil: product.availableUntil ?? null
        });
    }
});

// Execute the database seeder
seedDatabase(mockProducts);
console.log(`Successfully seeded ${mockProducts.length} Macky Merch products into the database.`);
