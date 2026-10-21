import React from 'react';
import { Calculator, Tag, Info } from 'lucide-react';
import { InventorySummary as IInventorySummary } from '../../types/inventory.types';

interface InventorySummaryProps {
  summary: IInventorySummary;
  selectedCount: number;
  totalProductsCount: number;
  applyDiscount: boolean;
  isCalculating: boolean;
  onToggleApplyDiscount: () => void;
}

const formatCurrency = (val: number): string => {
  return `$${val.toFixed(2)}`;
};

export const InventorySummary: React.FC<InventorySummaryProps> = ({
  summary,
  selectedCount,
  totalProductsCount,
  applyDiscount,
  isCalculating,
  onToggleApplyDiscount,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <Calculator size={18} />
          <h2>Resumen financiero</h2>
        </div>
        {isCalculating && (
          <div className="spinner" style={{ width: 14, height: 14 }} title="Calculando..." />
        )}
      </div>

      <div className="card-body summary-container">
        <div className="discount-toggle-card">
          <label className="toggle-switch-wrapper" htmlFor="discount-toggle">
            <div className="toggle-label-group">
              <span className="toggle-label-title">Descuento 5%</span>
              <span className="toggle-label-desc">Aplica solo a ítems seleccionados</span>
            </div>
            <div className="switch">
              <input
                id="discount-toggle"
                type="checkbox"
                checked={applyDiscount}
                onChange={onToggleApplyDiscount}
                aria-label="Activar o desactivar descuento del 5%"
              />
              <span className="slider"></span>
            </div>
          </label>

          <div className="summary-selection-info">
            <span>
              <Tag size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Seleccionados:
            </span>
            <strong>
              {selectedCount} de {totalProductsCount} {totalProductsCount === 1 ? 'producto' : 'productos'}
            </strong>
          </div>
        </div>

        <div className="summary-rows">
          <div className="summary-row">
            <span>Subtotal original</span>
            <span className="amount">{formatCurrency(summary.subtotal)}</span>
          </div>

          <div className={`summary-row ${applyDiscount && summary.discount > 0 ? 'discount-row' : ''}`}>
            <span>
              Descuento {applyDiscount ? '(5% aplicable)' : '(inactivo)'}
            </span>
            <span className="amount">
              {applyDiscount && summary.discount > 0 ? `-${formatCurrency(summary.discount)}` : '$0.00'}
            </span>
          </div>

          <div className="summary-row taxable-row">
            <span>Base imponible</span>
            <span className="amount">{formatCurrency(summary.taxableAmount)}</span>
          </div>

          <div className="summary-row">
            <span>IVA (13%)</span>
            <span className="amount">{formatCurrency(summary.tax)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Total final</span>
            <span className="amount">{formatCurrency(summary.total)}</span>
          </div>
        </div>

        {applyDiscount && selectedCount === 0 && (
          <div className="alert alert-warning" style={{ margin: 0, padding: '10px 12px', fontSize: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: 4 }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: 2, marginRight: 6 }} />
            <span>Selecciona al menos un producto en la tabla para aplicar el descuento del 5%.</span>
          </div>
        )}
      </div>
    </div>
  );
};
