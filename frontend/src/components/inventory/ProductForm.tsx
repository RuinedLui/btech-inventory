import { Minus, Plus } from 'lucide-react';
import { ProductFormData, ValidationErrors } from '../../types/inventory.types';

interface ProductFormProps {
  value: ProductFormData;
  errors?: ValidationErrors;
  disabled?: boolean;
  prefix: string;
  onChange: (data: ProductFormData) => void;
}

export function ProductForm({ value, errors, disabled, prefix, onChange }: ProductFormProps) {
  const handleQuantityStep = (delta: number) => {
    const current = parseInt(value.quantity, 10);
    const next = isNaN(current) ? (delta > 0 ? 1 : 1) : Math.max(1, current + delta);
    onChange({ ...value, quantity: String(next) });
  };

  const parsedQty = parseInt(value.quantity, 10);

  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label" htmlFor={`${prefix}-code`}>
          Código<span className="required-mark">*</span>
        </label>
        <input
          id={`${prefix}-code`}
          name="code"
          type="text"
          className={`form-input ${errors?.code ? 'has-error' : ''}`}
          placeholder="Ej. ROUTER-01"
          value={value.code}
          onChange={(e) => onChange({ ...value, code: e.target.value })}
          disabled={disabled}
          autoComplete="off"
          aria-invalid={Boolean(errors?.code)}
          aria-describedby={errors?.code ? `${prefix}-code-error` : undefined}
        />
        {errors?.code && <span id={`${prefix}-code-error`} className="field-error-message">{errors.code}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`${prefix}-description`}>
          Descripción<span className="required-mark">*</span>
        </label>
        <input
          id={`${prefix}-description`}
          name="description"
          type="text"
          className={`form-input ${errors?.description ? 'has-error' : ''}`}
          placeholder="Ej. Router Wi-Fi 6"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          disabled={disabled}
          autoComplete="off"
          aria-invalid={Boolean(errors?.description)}
          aria-describedby={errors?.description ? `${prefix}-description-error` : undefined}
        />
        {errors?.description && <span id={`${prefix}-description-error`} className="field-error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`${prefix}-quantity`}>
          Cantidad<span className="required-mark">*</span>
        </label>
        <div className="quantity-input-group">
          <button
            type="button"
            className="btn-stepper-input"
            onClick={() => handleQuantityStep(-1)}
            disabled={disabled || (!isNaN(parsedQty) && parsedQty <= 1)}
            aria-label="Disminuir cantidad"
            title="Disminuir"
          >
            <Minus size={14} />
          </button>
          <input
            id={`${prefix}-quantity`}
            name="quantity"
            type="text"
            className={`form-input quantity-input ${errors?.quantity ? 'has-error' : ''}`}
            placeholder="Ej. 1"
            value={value.quantity}
            onChange={(e) => onChange({ ...value, quantity: e.target.value })}
            disabled={disabled}
            autoComplete="off"
            aria-invalid={Boolean(errors?.quantity)}
            aria-describedby={errors?.quantity ? `${prefix}-quantity-error` : undefined}
          />
          <button
            type="button"
            className="btn-stepper-input"
            onClick={() => handleQuantityStep(1)}
            disabled={disabled}
            aria-label="Aumentar cantidad"
            title="Aumentar"
          >
            <Plus size={14} />
          </button>
        </div>
        {errors?.quantity && <span id={`${prefix}-quantity-error`} className="field-error-message">{errors.quantity}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`${prefix}-price`}>
          Precio unitario ($)<span className="required-mark">*</span>
        </label>
        <input
          id={`${prefix}-price`}
          name="price"
          type="text"
          className={`form-input ${errors?.price ? 'has-error' : ''}`}
          placeholder="Ej. 45.50"
          value={value.price}
          onChange={(e) => onChange({ ...value, price: e.target.value })}
          disabled={disabled}
          autoComplete="off"
          aria-invalid={Boolean(errors?.price)}
          aria-describedby={errors?.price ? `${prefix}-price-error` : undefined}
        />
        {errors?.price && <span id={`${prefix}-price-error`} className="field-error-message">{errors.price}</span>}
      </div>
    </div>
  );
}
