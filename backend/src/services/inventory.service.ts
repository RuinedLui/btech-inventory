import { IInventoryRepository } from '../repositories/inventory.repository.interface.js';
import {
  BatchValidationErrors, CreateProductDTO, InventorySummary, Product,
  SummaryRequestDTO, ValidationErrors,
} from '../types/inventory.types.js';
import { InventoryValidator } from '../validators/inventory.validator.js';
import { IDiscountStrategy, SelectedPercentageDiscountStrategy } from './discount.strategy.js';

export interface ProductResult {
  success: boolean;
  product?: Product;
  errors?: ValidationErrors;
  notFound?: boolean;
}

export interface BatchProductResult {
  success: boolean;
  products?: Product[];
  errors?: BatchValidationErrors;
  message?: string;
}

export class InventoryService {
  constructor(
    private readonly repository: IInventoryRepository,
    private readonly discountStrategy: IDiscountStrategy = new SelectedPercentageDiscountStrategy(0.05),
    private readonly taxRate: number = 0.13
  ) {}

  getAllProducts(): Product[] {
    return this.repository.getAll();
  }

  addProduct(dto: unknown): ProductResult {
    const validation = InventoryValidator.validate(dto, (code) => this.repository.exists(code));
    if (!validation.isValid || !validation.sanitizedData) {
      return { success: false, errors: validation.errors };
    }
    return { success: true, product: this.repository.save(validation.sanitizedData) };
  }

  addProducts(dtos: unknown): BatchProductResult {
    if (!Array.isArray(dtos) || dtos.length < 1 || dtos.length > 20) {
      return { success: false, message: 'Debes enviar entre 1 y 20 productos.' };
    }

    const seenCodes = new Set<string>();
    const validProducts: Product[] = [];
    const errors: BatchValidationErrors = {};

    for (let index = 0; index < dtos.length; index++) {
      const validation = InventoryValidator.validate(dtos[index], (code) =>
        this.repository.exists(code) || seenCodes.has(code)
      );
      if (!validation.isValid || !validation.sanitizedData) {
        errors[index] = validation.errors;
        continue;
      }
      seenCodes.add(validation.sanitizedData.code);
      validProducts.push(validation.sanitizedData);
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors, message: 'Revisa los datos de los productos indicados.' };
    }

    return { success: true, products: this.repository.saveMany(validProducts) };
  }

  updateProduct(originalCode: string, dto: unknown): ProductResult {
    const existing = this.repository.findByCode(originalCode);
    if (!existing) return { success: false, notFound: true };

    const validation = InventoryValidator.validate(dto, (code) =>
      code !== existing.code && this.repository.exists(code)
    );
    if (!validation.isValid || !validation.sanitizedData) {
      return { success: false, errors: validation.errors };
    }
    const product = this.repository.updateByCode(originalCode, validation.sanitizedData);
    return product ? { success: true, product } : { success: false, notFound: true };
  }

  calculateSummary(context?: SummaryRequestDTO): InventorySummary {
    const products = this.repository.getAll();
    const subtotalCents = products.reduce(
      (sum, product) => sum + product.quantity * Math.round(product.price * 100), 0
    );
    const discountCents = this.discountStrategy.calculateDiscountCents(products, {
      selectedCodes: context?.selectedCodes ?? [],
      applyDiscount: context?.applyDiscount ?? false,
    });
    const taxableAmountCents = Math.max(0, subtotalCents - discountCents);
    const taxCents = Math.round(taxableAmountCents * this.taxRate);
    return {
      subtotal: subtotalCents / 100,
      discount: discountCents / 100,
      taxableAmount: taxableAmountCents / 100,
      tax: taxCents / 100,
      total: (taxableAmountCents + taxCents) / 100,
    };
  }
}
