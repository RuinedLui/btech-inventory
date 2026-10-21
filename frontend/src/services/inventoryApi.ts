import {
  InventorySummary, MutationResult, Product, ProductFormData, SummaryRequestDTO, BatchValidationErrors,
} from '../types/inventory.types';

const RAW_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'https://btech-inventory-production.up.railway.app/api';
const CLEAN_URL = RAW_URL.replace(/\/+$/, '');
const BASE_URL = CLEAN_URL.endsWith('/api') ? CLEAN_URL : `${CLEAN_URL}/api`;

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  return data as T;
}

export const inventoryApi = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) throw new Error('No se pudo cargar el inventario.');
    return readResponse<Product[]>(response);
  },

  async createProducts(products: ProductFormData[]): Promise<MutationResult> {
    const response = await fetch(`${BASE_URL}/products/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });
    const data = await readResponse<{ message?: string; products?: Product[]; errors?: BatchValidationErrors }>(response);
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'No se pudieron registrar los productos.',
        batchErrors: data.errors,
      };
    }
    return { ...data, success: true };
  },

  async updateProduct(originalCode: string, product: ProductFormData): Promise<MutationResult> {
    const response = await fetch(`${BASE_URL}/products/${encodeURIComponent(originalCode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await readResponse<MutationResult>(response);
    return response.ok ? { ...data, success: true } : {
      success: false,
      message: data.message || 'No se pudo actualizar el producto.',
      errors: data.errors,
    };
  },

  async getSummary(request: SummaryRequestDTO): Promise<InventorySummary> {
    const response = await fetch(`${BASE_URL}/inventory/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('No se pudo calcular el resumen.');
    return readResponse<InventorySummary>(response);
  },
};
