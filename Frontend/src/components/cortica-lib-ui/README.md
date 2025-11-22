# Cortica UI Library

A comprehensive, standardized component library for the Cortez application ecosystem.

## Overview

`cortica-lib-ui` provides a complete set of reusable UI components built on top of shadcn/ui primitives, with custom components for charts, data visualization, filtering, and export functionality.

## Components

### Charts
- **DonutChart** - Customizable pie/donut charts with hover effects
- **BarChart** - Horizontal and vertical bar charts
- **LineChart** - Line charts for time-series data
- **WeeklyChart** - Weekly production visualization
- **KPICard** - Key performance indicator cards

### Data Display
- **DataTable** - Advanced table with sorting, resizing, and pagination
- **ProductsTable** - Specialized product data table
- **SummaryCards** - Summary statistics cards

### Filters
- **FilterBar** - Main filter interface
- **AdvancedFilterPanel** - Multi-criteria filter builder
- **SearchBar** - Search with integrated filters
- **DateRangePicker** - Date range selection

### Export
- **ExportDropdown** - Export menu with PDF/Excel options
- **PDFExport** - PDF generation utilities
- **ExcelExport** - Excel generation utilities

### Feedback
- **RefreshButton** - Button with loading state
- **LoadingState** - Loading indicators
- **EmptyState** - Empty data placeholders
- **ErrorState** - Error displays

### Layout
- **Dashboard** - Dashboard layout container
- **PageHeader** - Page header component
- **SidebarStats** - Sidebar statistics

### Utilities
- **TruncatedText** - Text truncation with tooltip
- **LogoDisplay** - Logo display component

## Usage

```tsx
import { DonutChart, DataTable, FilterBar } from '@/components/cortica-lib-ui';

// Use components
<DonutChart data={chartData} />
<DataTable columns={columns} data={rows} />
<FilterBar onFilterChange={handleFilter} />
```

## Design System

### Colors
- **Primary**: Red (#ff2626ff, #ef4444)
- **Secondary**: Gray scale
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red (darker)

### Typography
- **Font Family**: Inter, system fonts
- **Scale**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)

### Spacing
- **Base Unit**: 4px
- **Scale**: 2 (8px), 4 (16px), 6 (24px), 8 (32px)

## Development

All components are built with:
- **TypeScript** for type safety
- **React** for UI
- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **Recharts** for data visualization

## Documentation

See individual component files for detailed prop documentation and usage examples.
