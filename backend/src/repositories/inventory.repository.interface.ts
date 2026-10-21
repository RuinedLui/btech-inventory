import { Product } from '../types/inventory.types.js';

export interface IInventoryRepository {
  getAll(): Product[];
  findByCode(code: string): Product | undefined;
  save(product: Product): Product;
  saveMany(products: Product[]): Product[];
  updateByCode(originalCode: string, product: Product): Product | undefined;
  exists(code: string): boolean;
}
