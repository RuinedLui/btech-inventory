export interface Product {
  code: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CreateProductDTO {
  code: string;
  description: string;
  quantity: number | string;
  price: number | string;
}

export interface InventorySummary {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
}

export interface SummaryRequestDTO {
  selectedCodes?: string[];
  applyDiscount?: boolean;
}

export interface ValidationErrors {
  code?: string;
  description?: string;
  quantity?: string;
  price?: string;
  general?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  sanitizedData?: Product;
}

export interface BatchValidationErrors {
  [index: number]: ValidationErrors;
}
