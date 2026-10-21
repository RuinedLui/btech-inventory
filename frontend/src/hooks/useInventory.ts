import { useState, useEffect, useCallback } from 'react';
import { MutationResult, Product, ProductFormData } from '../types/inventory.types';
import { inventoryApi } from '../services/inventoryApi';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      setProducts(await inventoryApi.getProducts());
      setGeneralError(null);
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Error al cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refreshProducts(); }, [refreshProducts]);

  const addProducts = async (items: ProductFormData[]): Promise<MutationResult> => {
    try {
      const result = await inventoryApi.createProducts(items);
      if (result.success && result.products) {
        setProducts((prev) => [...prev, ...result.products!]);
        setGeneralError(null);
        setSuccessMessage(`${result.products.length} ${result.products.length === 1 ? 'producto registrado' : 'productos registrados'} correctamente.`);
      }
      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión.' };
    }
  };

  const editProduct = async (originalCode: string, data: ProductFormData): Promise<MutationResult> => {
    try {
      const result = await inventoryApi.updateProduct(originalCode, data);
      if (result.success && result.product) {
        setProducts((prev) => prev.map((product) => product.code === originalCode ? result.product! : product));
        setGeneralError(null);
        setSuccessMessage(`Producto ${result.product.code} actualizado.`);
      }
      return result;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión.' };
    }
  };

  return {
    products, isLoading, generalError, successMessage,
    addProducts, editProduct, refreshProducts,
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}
