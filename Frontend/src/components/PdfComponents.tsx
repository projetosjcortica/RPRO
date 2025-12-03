import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface TableHeaderProps {
  columns: string[];
  styles: any;
}

// OTIMIZAÇÃO: Componente memoizado para cabeçalho de tabela
export const TableHeader = React.memo<TableHeaderProps>(({ columns, styles }) => (
  <View style={styles.tableRow}>
    {columns.map((col, idx) => (
      <Text key={idx} style={[styles.tableCell, styles.tableHeader]}>
        {col}
      </Text>
    ))}
  </View>
));

TableHeader.displayName = 'TableHeader';

interface TableRowProps {
  data: any[];
  styles: any;
}

// OTIMIZAÇÃO: Componente memoizado para linha de tabela
export const TableRow = React.memo<TableRowProps>(({ data, styles }) => (
  <View style={styles.tableRow}>
    {data.map((cell, idx) => (
      <Text key={idx} style={styles.tableCell}>
        {cell}
      </Text>
    ))}
  </View>
));

TableRow.displayName = 'TableRow';
