import { useCallback, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useInventorySummary } from '../hooks/useInventorySummary';
import { Header } from '../components/ui/Header';
import { Alert } from '../components/ui/Alert';
import { ProductTable } from '../components/inventory/ProductTable';
import { ProductModal } from '../components/inventory/ProductModal';
import { InventorySummary } from '../components/summary/InventorySummary';
import { Product } from '../types/inventory.types';

export function InventoryPage() {
  const {
    products, isLoading, generalError, successMessage,
    addProducts, editProduct, clearSuccessMessage,
  } = useInventory();
  const {
    selectedCodes, applyDiscount, summary, isCalculating, summaryError,
    toggleProductSelection, toggleSelectAll, toggleApplyDiscount, renameSelectedCode,
  } = useInventorySummary(products);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const closeModal = useCallback(() => { setModalOpen(false); setEditingProduct(undefined); }, []);
  const openCreate = () => { clearSuccessMessage(); setEditingProduct(undefined); setModalOpen(true); };
  const openEdit = (product: Product) => { clearSuccessMessage(); setEditingProduct(product); setModalOpen(true); };

  return (
    <div className="app-container">
      <Header />
      {generalError && <Alert type="error" message={generalError} />}
      {summaryError && <Alert type="error" message={summaryError} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      <main className="dashboard-grid">
        <section className="main-column" aria-label="Catálogo de productos">
          <ProductTable
            products={products}
            selectedCodes={selectedCodes}
            isLoading={isLoading}
            onToggleSelect={toggleProductSelection}
            onToggleSelectAll={toggleSelectAll}
            onAdd={openCreate}
            onEdit={openEdit}
          />
        </section>
        <aside className="sidebar-column" aria-label="Resumen financiero">
          <InventorySummary
            summary={summary}
            selectedCount={selectedCodes.length}
            totalProductsCount={products.length}
            applyDiscount={applyDiscount}
            isCalculating={isCalculating}
            onToggleApplyDiscount={toggleApplyDiscount}
          />
        </aside>
      </main>
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={closeModal}
          onCreate={addProducts}
          onUpdate={editProduct}
          onUpdated={renameSelectedCode}
        />
      )}
    </div>
  );
}
