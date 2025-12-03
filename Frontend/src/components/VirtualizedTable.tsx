import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps {
  data: any[];
  columns: { key: string; header: string; width?: number }[];
  rowHeight?: number;
  containerHeight?: number;
}

// OTIMIZAÇÃO: Tabela virtualizada para renderizar apenas linhas visíveis
// Melhora drasticamente a performance com grandes volumes de dados
export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  columns,
  rowHeight = 50,
  containerHeight = 600,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Virtualizer gerencia quais linhas renderizar baseado no scroll
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // Renderiza 5 linhas extras acima/abaixo para scroll suave
  });

  // OTIMIZAÇÃO: Memoizar items virtuais para evitar recálculos
  const virtualItems = useMemo(
    () => rowVirtualizer.getVirtualItems(),
    [rowVirtualizer]
  );

  return (
    <div
      ref={parentRef}
      style={{
        height: `${containerHeight}px`,
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Cabeçalho fixo */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            borderBottom: '2px solid #d1d5db',
          }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              style={{
                flex: col.width ? `0 0 ${col.width}px` : 1,
                padding: '12px',
                fontWeight: 'bold',
              }}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Linhas virtualizadas */}
        {virtualItems.map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: virtualRow.index % 2 === 0 ? '#ffffff' : '#f9fafb',
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  style={{
                    flex: col.width ? `0 0 ${col.width}px` : 1,
                    padding: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row[col.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// OTIMIZAÇÃO: Exemplo de uso
/*
<VirtualizedTable
  data={reportData}
  columns={[
    { key: 'timestamp', header: 'Data/Hora', width: 180 },
    { key: 'formula', header: 'Fórmula', width: 200 },
    { key: 'quantidade', header: 'Quantidade', width: 120 },
    { key: 'status', header: 'Status' },
  ]}
  rowHeight={50}
  containerHeight={600}
/>
*/
