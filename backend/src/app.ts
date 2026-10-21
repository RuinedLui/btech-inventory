import express, { Application } from 'express';
import cors from 'cors';
import { InMemoryInventoryRepository } from './repositories/inMemoryInventory.repository.js';
import { SelectedPercentageDiscountStrategy } from './services/discount.strategy.js';
import { InventoryService } from './services/inventory.service.js';
import { InventoryController } from './controllers/inventory.controller.js';
import { createInventoryRouter } from './routes/inventory.routes.js';

export function createApp(): Application {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const repository = new InMemoryInventoryRepository();
  const service = new InventoryService(repository, new SelectedPercentageDiscountStrategy(0.05));
  const controller = new InventoryController(service);
  app.use('/api', createInventoryRouter(controller));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return app;
}
