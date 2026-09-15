import express from 'express';
import { productRouter } from './routes/product.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(express.json());

app.use('/api/products', productRouter);

app.use(errorHandler);

export default app;
