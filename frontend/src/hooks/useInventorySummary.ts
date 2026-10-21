import { useState, useEffect } from 'react';
import { InventorySummary, Product } from '../types/inventory.types';
import { inventoryApi } from '../services/inventoryApi';

const EMPTY_SUMMARY: InventorySummary = {
  subtotal: 0, discount: 0, taxableAmount: 0, tax: 0, total: 0,
};

export function useInventorySummary(products: Product[]) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [summary, setSummary] = useState<InventorySummary>(EMPTY_SUMMARY);
  const [isCalculating, setIsCalculating] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    if (products.length === 0) {
      setSummary(EMPTY_SUMMARY);
      return;
    }
    setIsCalculating(true);
    setSummaryError(null);
    void inventoryApi.getSummary({ selectedCodes, applyDiscount })
      .then((data) => { if (current) setSummary(data); })
      .catch((error: unknown) => {
        if (current) setSummaryError(error instanceof Error ? error.message : 'Error al calcular los totales.');
      })
      .finally(() => { if (current) setIsCalculating(false); });
    return () => { current = false; };
  }, [products, selectedCodes, applyDiscount]);

  const toggleProductSelection = (code: string) => {
    setSelectedCodes((prev) => prev.includes(code)
      ? prev.filter((selected) => selected !== code)
      : [...prev, code]);
  };

  const toggleSelectAll = () => {
    setSelectedCodes((prev) => prev.length === products.length
      ? [] : products.map((product) => product.code));
  };

  const renameSelectedCode = (oldCode: string, newCode: string) => {
    if (oldCode !== newCode) {
      setSelectedCodes((prev) => prev.map((code) => code === oldCode ? newCode : code));
    }
  };

  return {
    selectedCodes, applyDiscount, summary, isCalculating, summaryError,
    toggleProductSelection, toggleSelectAll, renameSelectedCode,
    toggleApplyDiscount: () => setApplyDiscount((prev) => !prev),
  };
}
