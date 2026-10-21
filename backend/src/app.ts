import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import { InMemoryInventoryRepository } from './repositories/inMemoryInventory.repository.js';
import { SelectedPercentageDiscountStrategy } from './services/discount.strategy.js';
import { InventoryService } from './services/inventory.service.js';
import { InventoryController } from './controllers/inventory.controller.js';
import { createInventoryRouter } from './routes/inventory.routes.js';

function configureCors(): express.RequestHandler {
  const customOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (customOrigins.includes('*') || customOrigins.includes(origin)) {
        return callback(null, true);
      }

      const isNetlify = /^https:\/\/([a-zA-Z0-9_-]+\.)*netlify\.app$/.test(origin);
      if (isNetlify) {
        return callback(null, true);
      }

      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }

      if (customOrigins.length === 0) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  return cors(corsOptions);
}

export function createApp(): Application {
  const app = express();
  app.use(configureCors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  const repository = new InMemoryInventoryRepository();
  const service = new InventoryService(repository, new SelectedPercentageDiscountStrategy(0.05));
  const controller = new InventoryController(service);
  app.use('/api', createInventoryRouter(controller));

  return app;
}
