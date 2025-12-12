// import React, { Suspense, lazy } from 'react';

// // OTIMIZAÇÃO: Lazy loading de componentes pesados
// // Reduz o bundle inicial e melhora o tempo de carregamento

// // Componentes PDF (grandes e raramente usados)
// export const Pdf = lazy(() => import('./Pdf'));
// export const CustomPdf = lazy(() => import('./CustomPdf'));

// // Componente de relatório (grande)
// export const Report = lazy(() => import('./report'));

// // Componente de tabela (pode ser grande com muitos dados)
// export const TableComponent = lazy(() => import('./TableComponent'));

// Componente de loading para Suspense
export const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Carregando...' 
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#6b7280',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #af1e1e',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px',
      }} />
      <p>{message}</p>
    </div>
  </div>
);

// OTIMIZAÇÃO: Exemplo de uso com Suspense
/*
import { Report, LoadingFallback } from './components/LazyComponents';

function App() {
  return (
    <Suspense fallback={<LoadingFallback message="Carregando relatório..." />}>
      <Report />
    </Suspense>
  );
}
*/
