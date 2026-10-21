import { Boxes } from 'lucide-react';

export function Header() {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-badge">B-TECH</div>
        <div className="brand-titles">
          <h1>Gestión de inventario</h1>
          <p>Control centralizado de productos, impuestos y descuentos</p>
        </div>
      </div>
      <div className="header-meta"><div className="badge-tag"><Boxes size={14}/><span>Inventario</span></div></div>
    </header>
  );
}
