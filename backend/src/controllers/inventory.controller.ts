import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { SummaryRequestDTO } from '../types/inventory.types.js';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  getProducts = (_req: Request, res: Response): void => {
    res.json(this.inventoryService.getAllProducts());
  };

  createProduct = (req: Request, res: Response): void => {
    const result = this.inventoryService.addProduct(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Revisa los datos del producto.', errors: result.errors });
      return;
    }
    res.status(201).json({ message: 'Producto registrado.', product: result.product });
  };

  createProducts = (req: Request, res: Response): void => {
    const result = this.inventoryService.addProducts(req.body?.products);
    if (!result.success) {
      res.status(400).json({ message: result.message, errors: result.errors });
      return;
    }
    res.status(201).json({ message: 'Productos registrados.', products: result.products });
  };

  updateProduct = (req: Request, res: Response): void => {
    const result = this.inventoryService.updateProduct(req.params.code, req.body);
    if (result.notFound) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }
    if (!result.success) {
      res.status(400).json({ message: 'Revisa los datos del producto.', errors: result.errors });
      return;
    }
    res.json({ message: 'Producto actualizado.', product: result.product });
  };

  getSummary = (req: Request, res: Response): void => {
    const context: SummaryRequestDTO = {
      selectedCodes: Array.isArray(req.body?.selectedCodes) &&
        req.body.selectedCodes.every((code: unknown) => typeof code === 'string')
        ? req.body.selectedCodes : [],
      applyDiscount: req.body?.applyDiscount === true,
    };
    res.json(this.inventoryService.calculateSummary(context));
  };
}
