import { useEffect, useRef, useState, FormEvent } from 'react';
import { X, Save } from 'lucide-react';
import { MutationResult, Product, ProductFormData, ValidationErrors } from '../../types/inventory.types';
import { ProductForm } from './ProductForm';

type ProductModalProps = {
  product?: Product;
  onClose: () => void;
  onCreate: (product: ProductFormData) => Promise<MutationResult>;
  onUpdate: (originalCode: string, data: ProductFormData) => Promise<MutationResult>;
  onUpdated: (oldCode: string, newCode: string) => void;
};

const emptyProduct = (): ProductFormData => ({ code: '', description: '', quantity: '1', price: '' });
const toForm = (product: Product): ProductFormData => ({
  code: product.code,
  description: product.description,
  quantity: String(product.quantity),
  price: product.price.toFixed(2),
});

export function ProductModal({ product, onClose, onCreate, onUpdate, onUpdated }: ProductModalProps) {
  const editing = Boolean(product);
  const [formData, setFormData] = useState<ProductFormData>(product ? toForm(product) : emptyProduct());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.querySelector<HTMLInputElement>('input[name="code"]')?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
      previousFocus?.focus();
    };
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);
    try {
      const result = editing && product
        ? await onUpdate(product.code, formData)
        : await onCreate(formData);
      if (result.success) {
        if (editing && product && result.product) onUpdated(product.code, result.product.code);
        onClose();
      } else {
        setErrors(result.errors ?? {});
        setGeneralError(result.message || 'No se pudieron guardar los cambios.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <div ref={modalRef} className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal-header">
          <div>
            <h2 id="product-modal-title">{editing ? 'Editar producto' : 'Agregar producto'}</h2>
            <p>{editing ? 'Actualiza la información registrada.' : 'Ingresa los datos para registrar un nuevo producto en el inventario.'}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} disabled={submitting} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-content">
            {generalError && <div className="modal-error" role="alert">{generalError}</div>}
            <ProductForm
              prefix="product"
              value={formData}
              errors={errors}
              disabled={submitting}
              onChange={(next) => {
                setFormData(next);
                setErrors({});
                setGeneralError(null);
              }}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16}/>
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
