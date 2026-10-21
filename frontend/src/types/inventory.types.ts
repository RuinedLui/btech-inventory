export interface Product {
  code: string;
  description: string;
  quantity: number;
  price: number;
}

export interface ProductFormData {
  code: string;
  description: string;
  quantity: string;
  price: string;
}

export interface InventorySummary {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
}

export interface SummaryRequestDTO {
  selectedCodes: string[];
  applyDiscount: boolean;
}

export interface ValidationErrors {
  code?: string;
  description?: string;
  quantity?: string;
  price?: string;
  general?: string;
}

export type BatchValidationErrors = Record<number, ValidationErrors>;

export interface MutationResult {
  success: boolean;
  product?: Product;
  products?: Product[];
  message?: string;
  errors?: ValidationErrors;
  batchErrors?: BatchValidationErrors;
}
