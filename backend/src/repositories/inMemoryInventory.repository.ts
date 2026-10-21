import { IInventoryRepository } from './inventory.repository.interface.js';
import { Product } from '../types/inventory.types.js';
import { INITIAL_PRODUCTS } from '../data/initialProducts.js';

export class InMemoryInventoryRepository implements IInventoryRepository {
  private products: Product[];

  constructor(initialData: Product[] = INITIAL_PRODUCTS) {
    this.products = initialData.map((product) => ({ ...product }));
  }

  getAll(): Product[] {
    return this.products.map((product) => ({ ...product }));
  }

  findByCode(code: string): Product | undefined {
    const product = this.products.find((item) => item.code === code.trim().toUpperCase());
    return product ? { ...product } : undefined;
  }

  exists(code: string): boolean {
    return this.products.some((item) => item.code === code.trim().toUpperCase());
  }

  save(product: Product): Product {
    this.products.push({ ...product });
    return { ...product };
  }

  saveMany(products: Product[]): Product[] {
    const copies = products.map((product) => ({ ...product }));
    this.products.push(...copies);
    return copies.map((product) => ({ ...product }));
  }

  updateByCode(originalCode: string, product: Product): Product | undefined {
    const index = this.products.findIndex((item) => item.code === originalCode.trim().toUpperCase());
    if (index === -1) return undefined;
    this.products[index] = { ...product };
    return { ...product };
  }
}
