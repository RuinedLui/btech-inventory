import { Product } from '../types/inventory.types.js';

export interface DiscountStrategyContext {
  selectedCodes?: string[];
  applyDiscount?: boolean;
}

export interface IDiscountStrategy {
  readonly name: string;
  calculateDiscountCents(products: Product[], context?: DiscountStrategyContext): number;
}

export class SelectedPercentageDiscountStrategy implements IDiscountStrategy {
  readonly name = 'SelectedPercentageDiscount';

  constructor(private readonly rate: number = 0.05) {}

  calculateDiscountCents(products: Product[], context?: DiscountStrategyContext): number {
    if (!context?.applyDiscount || !context.selectedCodes || context.selectedCodes.length === 0) {
      return 0;
    }

    const selectedSet = new Set(
      context.selectedCodes.map((code) => code.trim().toUpperCase())
    );

    let totalSelectedCents = 0;

    for (const product of products) {
      if (selectedSet.has(product.code.toUpperCase())) {
        const unitPriceCents = Math.round(product.price * 100);
        totalSelectedCents += product.quantity * unitPriceCents;
      }
    }

    return Math.round(totalSelectedCents * this.rate);
  }
}
