import { ProductFormData, ValidationErrors } from '../../types/inventory.types';

interface ProductFormProps {
  value: ProductFormData;
  errors?: ValidationErrors;
  disabled?: boolean;
  prefix: string;
  onChange: (data: ProductFormData) => void;
}

const FIELDS: { key: keyof ProductFormData; label: string; placeholder: string }[] = [
  { key: 'code', label: 'Código', placeholder: 'Ej. ROUTER-01' },
  { key: 'description', label: 'Descripción', placeholder: 'Ej. Router Wi-Fi 6' },
  { key: 'quantity', label: 'Cantidad', placeholder: 'Ej. 4' },
  { key: 'price', label: 'Precio unitario ($)', placeholder: 'Ej. 45.50' },
];

export function ProductForm({ value, errors, disabled, prefix, onChange }: ProductFormProps) {
  return (
    <div className="form-grid">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div className="form-group" key={key}>
          <label className="form-label" htmlFor={`${prefix}-${key}`}>{label}<span className="required-mark">*</span></label>
          <input
            id={`${prefix}-${key}`}
            name={key}
            type="text"
            className={`form-input ${errors?.[key] ? 'has-error' : ''}`}
            placeholder={placeholder}
            value={value[key]}
            onChange={(event) => onChange({ ...value, [key]: event.target.value })}
            disabled={disabled}
            autoComplete="off"
            aria-invalid={Boolean(errors?.[key])}
            aria-describedby={errors?.[key] ? `${prefix}-${key}-error` : undefined}
          />
          {errors?.[key] && <span id={`${prefix}-${key}-error`} className="field-error-message">{errors[key]}</span>}
        </div>
      ))}
    </div>
  );
}
