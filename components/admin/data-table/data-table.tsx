'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type Column<T> = {
  key: string
  label: string | React.ReactNode
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  pagination,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[var(--brand-neon)]/20 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-white/70"
                  onClick={
                    column.sortable && onSort
                      ? () => {
                          onSort(column.key)
                        }
                      : undefined
                  }
                >
                  <div
                    className={
                      column.sortable
                        ? 'flex cursor-pointer items-center gap-2 hover:text-white'
                        : ''
                    }
                  >
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span className="text-[var(--brand-neon)]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-white/50">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-white/50">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-white/80">
                      {column.render
                        ? column.render(item)
                        : ((item as Record<string, unknown>)[column.key]?.toString() ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">
            Page {pagination.page + 1} sur {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                pagination.onPageChange(pagination.page - 1)
              }}
              disabled={pagination.page === 0}
              className="border-white/20 text-white hover:bg-white/5"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                pagination.onPageChange(pagination.page + 1)
              }}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Suivant
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
