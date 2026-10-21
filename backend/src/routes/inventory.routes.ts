import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';

export function createInventoryRouter(controller: InventoryController): Router {
  const router = Router();
  router.get('/products', controller.getProducts);
  router.post('/products', controller.createProduct);
  router.post('/products/batch', controller.createProducts);
  router.put('/products/:code', controller.updateProduct);
  router.post('/inventory/summary', controller.getSummary);
  return router;
}
