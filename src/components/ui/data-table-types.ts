
import React from 'react';

export type Column<T> = {
  key: string;
  title: string;
  accessorKey?: keyof T | string;
  id?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  cell?: ({ row }: { row: any }) => React.ReactElement;
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  primaryKey?: keyof T;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  searchable?: boolean;
  isLoading?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
}
