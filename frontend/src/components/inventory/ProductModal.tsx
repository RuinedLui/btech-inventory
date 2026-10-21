import { useEffect, useRef, useState, FormEvent } from 'react';
import { Minus, Plus, X, Save } from 'lucide-react';
import { BatchValidationErrors, MutationResult, Product, ProductFormData, ValidationErrors } from '../../types/inventory.types';
import { ProductForm } from './ProductForm';

type ProductModalProps = {
  product?: Product;
  onClose: () => void;
  onCreate: (products: ProductFormData[]) => Promise<MutationResult>;
  onUpdate: (originalCode: string, data: ProductFormData) => Promise<MutationResult>;
  onUpdated: (oldCode: string, newCode: string) => void;
};

const emptyProduct = (): ProductFormData => ({ code: '', description: '', quantity: '', price: '' });
const toForm = (product: Product): ProductFormData => ({
  code: product.code,
  description: product.description,
  quantity: String(product.quantity),
  price: product.price.toFixed(2),
});

export function ProductModal({ product, onClose, onCreate, onUpdate, onUpdated }: ProductModalProps) {
  const editing = Boolean(product);
  const [forms, setForms] = useState<ProductFormData[]>([product ? toForm(product) : emptyProduct()]);
  const [errors, setErrors] = useState<BatchValidationErrors>({});
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

  const changeCount = (count: number) => {
    if (editing || count < 1 || count > 20) return;
    setForms((prev) => Array.from({ length: count }, (_, index) => prev[index] ?? emptyProduct()));
    setErrors({});
    setGeneralError(null);
  };

  const updateForm = (index: number, form: ProductFormData) => {
    setForms((prev) => prev.map((entry, row) => row === index ? form : entry));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setGeneralError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);
    try {
      const result = editing && product
        ? await onUpdate(product.code, forms[0])
        : await onCreate(forms);
      if (result.success) {
        if (editing && product && result.product) onUpdated(product.code, result.product.code);
        onClose();
      } else {
        setErrors(editing ? { 0: result.errors ?? {} } : result.batchErrors ?? {});
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
            <h2 id="product-modal-title">{editing ? 'Editar producto' : 'Agregar productos'}</h2>
            <p>{editing ? 'Actualiza la información registrada.' : 'Registra uno o varios artículos en el inventario.'}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} disabled={submitting} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          {!editing && (
            <div className="modal-count">
              <div><strong>Cantidad de productos a registrar</strong><span>Agrega hasta 20 productos en una operación.</span></div>
              <div className="count-stepper">
                <button type="button" aria-label="Quitar un producto" onClick={() => changeCount(forms.length - 1)} disabled={forms.length === 1 || submitting}><Minus size={16}/></button>
                <span aria-live="polite">{forms.length}</span>
                <button type="button" aria-label="Agregar otro producto" onClick={() => changeCount(forms.length + 1)} disabled={forms.length === 20 || submitting}><Plus size={16}/></button>
              </div>
            </div>
          )}
          <div className="modal-content">
            {generalError && <div className="modal-error" role="alert">{generalError}</div>}
            {forms.map((form, index) => (
              <div className="modal-form-section" key={index}>
                {!editing && <div className="modal-product-index"><span>Producto {index + 1}</span><span>de {forms.length}</span></div>}
                <ProductForm
                  prefix={`item-${index}`}
                  value={form}
                  errors={errors[index] as ValidationErrors | undefined}
                  disabled={submitting}
                  onChange={(next) => updateForm(index, next)}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16}/>
              {submitting ? 'Guardando...' : editing ? 'Guardar cambios' : `Registrar ${forms.length} ${forms.length === 1 ? 'producto' : 'productos'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
