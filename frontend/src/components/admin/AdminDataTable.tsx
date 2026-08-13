import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button as MuiButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StorageIcon from '@mui/icons-material/Storage';

export interface ColumnDef<T> {
  id: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
}

export function AdminDataTable<T extends { id?: string }>({
  title,
  subtitle,
  columns,
  data,
  isLoading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = data.length,
  onPageChange,
  onRowsPerPageChange,
  onExportCsv,
  onExportExcel,
}: AdminDataTableProps<T>) {
  const handleCsvClick = () => {
    if (onExportCsv) {
      onExportCsv();
    } else {
      // Automatic fallback CSV exporter
      const headers = columns.map((c) => c.label).join(',');
      const rows = data
        .map((row) => columns.map((c) => JSON.stringify((row as any)[c.id] || '')).join(','))
        .join('\n');
      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
      a.click();
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <MuiButton
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleCsvClick}
            sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
          >
            Export CSV
          </MuiButton>
          {onExportExcel && (
            <MuiButton
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={onExportExcel}
              sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
            >
              Export Excel
            </MuiButton>
          )}
        </Stack>
      </Box>

      {/* Table Content */}
      {isLoading ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={32} color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading records...
          </Typography>
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <StorageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" fontWeight={800} gutterBottom>
            No Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No entries match the current filter or search criteria.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.id} sx={{ fontWeight: 800, color: 'text.secondary', py: 1.5 }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((col) => (
                    <TableCell key={col.id} sx={{ py: 1.8 }}>
                      {col.render ? col.render(row) : (row as any)[col.id] || '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {onPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{ borderTop: '1px solid #F1F5F9' }}
        />
      )}
    </Paper>
  );
}

export default AdminDataTable;
