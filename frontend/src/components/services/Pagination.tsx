import React from 'react';
import { Box, Typography, Pagination as MuiPagination } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 5,
        pt: 3,
        borderTop: '1px solid #E2E8F0',
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        Showing <Typography component="span" fontWeight={800} color="text.primary">{startItem}–{endItem}</Typography> of{' '}
        <Typography component="span" fontWeight={800} color="text.primary">{totalItems}</Typography> verified providers
      </Typography>

      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={(_e, val) => {
          onPageChange(val);
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        color="primary"
        size="medium"
        sx={{
          '& .MuiPaginationItem-root': {
            fontWeight: 700,
            borderRadius: '10px',
          },
        }}
      />
    </Box>
  );
};

export default Pagination;
