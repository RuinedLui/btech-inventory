import { Package, CheckSquare, Square, Pencil, Plus } from 'lucide-react';
import { Product } from '../../types/inventory.types';

interface ProductTableProps {
  products: Product[];
  selectedCodes: string[];
  isLoading: boolean;
  onToggleSelect: (code: string) => void;
  onToggleSelectAll: () => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
}

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

export function ProductTable({
  products, selectedCodes, isLoading, onToggleSelect, onToggleSelectAll, onAdd, onEdit,
}: ProductTableProps) {
  const allSelected = products.length > 0 && selectedCodes.length === products.length;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <Package size={18} />
          <h2>Productos en inventario ({products.length})</h2>
        </div>
        <div className="card-header-actions">
          {products.length > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onToggleSelectAll}>
              {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
              <span>{allSelected ? 'Deseleccionar' : 'Seleccionar todos'}</span>
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={16} /> <span>Agregar productos</span>
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="state-loading"><div className="spinner" /><span>Cargando productos...</span></div>
        ) : products.length === 0 ? (
          <div className="state-empty"><Package size={36} color="#94a3b8" /><p>No hay productos registrados.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="custom-checkbox" checked={allSelected} onChange={onToggleSelectAll} aria-label="Seleccionar todos" /></th>
                  <th>Código</th><th>Descripción</th>
                  <th className="cell-numeric">Cantidad</th>
                  <th className="cell-numeric">Precio unitario</th>
                  <th className="cell-numeric">Subtotal</th>
                  <th className="actions-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const selected = selectedCodes.includes(product.code);
                  const lineTotalCents = product.quantity * Math.round(product.price * 100);
                  return (
                    <tr key={product.code} className={selected ? 'row-selected' : ''}>
                      <td className="checkbox-cell">
                        <input type="checkbox" className="custom-checkbox" checked={selected} onChange={() => onToggleSelect(product.code)} aria-label={`Seleccionar ${product.description}`} />
                      </td>
                      <td><span className="code-pill">{product.code}</span></td>
                      <td><strong>{product.description}</strong></td>
                      <td className="cell-numeric">{product.quantity}</td>
                      <td className="cell-numeric">{formatCurrency(product.price)}</td>
                      <td className="cell-numeric"><strong>{formatCurrency(lineTotalCents / 100)}</strong></td>
                      <td className="actions-cell">
                        <button className="btn-icon-table" type="button" onClick={() => onEdit(product)} title={`Editar ${product.description}`} aria-label={`Editar ${product.description}`}><Pencil size={16}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
