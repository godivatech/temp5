import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Column, DataTableProps } from './data-table-types';

export function DataTable<T>({
  data,
  columns,
  primaryKey,
  onRowClick,
  actions,
  searchable = true,
  isLoading = false,
  pagination = true,
  itemsPerPage = 10,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key.toString()))
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData([...data]);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = data.filter(item => {
        return columns.some(column => {
          const key = column.key as keyof T;
          const value = item[key];
          
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowercasedSearch);
          } else if (typeof value === 'number') {
            return value.toString().includes(lowercasedSearch);
          }
          return false;
        });
      });
      setFilteredData(filtered);
    }
  }, [data, searchTerm, columns]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData]);

  const handleSort = (key: keyof T | string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const keyStr = key.toString();
      
      if (keyStr.includes('.')) {
        const keys = keyStr.split('.');
        let aVal: any = a;
        let bVal: any = b;
        for (const k of keys) {
          aVal = aVal?.[k];
          bVal = bVal?.[k];
        }
        
        if (typeof aVal === 'string') {
          return direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      const aVal = a[key as keyof T];
      const bVal = b[key as keyof T];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredData(sortedData);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = pagination
    ? filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : filteredData;

  const toggleColumnVisibility = (key: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(key)) {
      if (newVisibleColumns.size > 1) {
        newVisibleColumns.delete(key);
      }
    } else {
      newVisibleColumns.add(key);
    }
    setVisibleColumns(newVisibleColumns);
  };

  return (
    <div className="w-full animate-fade-in">
      {(searchable || columns.length > 1) && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          {columns.length > 1 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Columns</span>
              </Button>
              
              {showColumnSelector && (
                <div className="absolute z-10 right-0 mt-2 p-3 bg-white rounded-lg border shadow-lg animate-scale-in">
                  <h3 className="text-sm font-medium mb-2">Show columns</h3>
                  <div className="space-y-1">
                    {columns.map((column) => (
                      <label 
                        key={column.key.toString()} 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(column.key.toString())}
                          onChange={() => toggleColumnVisibility(column.key.toString())}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{column.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative overflow-x-auto rounded-lg border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b">
            <tr>
              {columns.map((column) => 
                visibleColumns.has(column.key.toString()) && (
                  <th
                    key={column.key.toString()}
                    className="px-4 py-3 whitespace-nowrap"
                  >
                    {column.sortable !== false ? (
                      <button
                        className="flex items-center gap-1"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.title}
                        {sortConfig?.key === column.key && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                )
              )}
              {actions && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => 
                    visibleColumns.has(column.key.toString()) && (
                      <td key={column.key.toString()} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    )
                  )}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={item[primaryKey] as string}
                  className={cn(
                    "bg-white hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => 
                    visibleColumns.has(column.key.toString()) && (
                      <td key={column.key.toString()} className="px-4 py-3">
                        {column.render
                          ? column.render(item)
                          : item[column.key as keyof T]?.toString()}
                      </td>
                    )
                  )}
                  {actions && (
                    <td className="px-4 py-3">
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    actions 
                      ? columns.filter(col => visibleColumns.has(col.key.toString())).length + 1
                      : columns.filter(col => visibleColumns.has(col.key.toString())).length
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
            {filteredData.length} items
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber: number;
                
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else {
                  if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={
                      currentPage === pageNumber
                        ? "bg-primary hover:bg-primary/90 font-medium"
                        : ""
                    }
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="mx-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
