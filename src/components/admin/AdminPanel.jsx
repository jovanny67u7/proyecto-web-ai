import React, { useState } from 'react';
import TabProductos from './TabProductos';
import TabClientes from './TabClientes';
import TabUsuarios from './TabUsuarios';
import TabReportes from './TabReportes';

const TABS = [
  { id: 'productos', label: 'Productos y Categorías', Componente: TabProductos },
  { id: 'clientes', label: 'Clientes de Confianza', Componente: TabClientes },
  { id: 'usuarios', label: 'Usuarios', Componente: TabUsuarios },
  { id: 'reportes', label: 'Reportes', Componente: TabReportes },
];

export default function AdminPanel() {
  const [tabActiva, setTabActiva] = useState('productos');
  const TabActual = TABS.find((t) => t.id === tabActiva).Componente;

  return (
    <div>
      <div style={tabsBarStyles}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTabActiva(tab.id)}
            style={tabActiva === tab.id ? tabActivoStyles : tabStyles}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <TabActual />
      </div>
    </div>
  );
}

const tabsBarStyles = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '0.5px solid var(--border)', paddingBottom: '1rem' };
const tabStyles = { background: 'transparent', border: '0.5px solid var(--border)', borderRadius: '999px', padding: '0.5rem 1.1rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'Poppins', sans-serif" };
const tabActivoStyles = { ...tabStyles, background: 'linear-gradient(135deg, var(--brand-green), var(--brand-blue))', color: '#fff', border: 'none' };
