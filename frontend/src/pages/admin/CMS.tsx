import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AdminDataTable, ColumnDef } from '../../components';

export interface ICmsPage {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  status: 'PUBLISHED' | 'DRAFT';
}

const MOCK_PAGES: ICmsPage[] = [
  { id: 'cms-1', title: 'Terms & Conditions', slug: '/terms', lastUpdated: '2026-08-01', status: 'PUBLISHED' },
  { id: 'cms-2', title: 'Privacy Policy', slug: '/privacy', lastUpdated: '2026-08-01', status: 'PUBLISHED' },
  { id: 'cms-3', title: 'Safety & Hygiene Guarantee', slug: '/safety', lastUpdated: '2026-07-20', status: 'PUBLISHED' },
  { id: 'cms-4', title: 'Help & Support FAQ', slug: '/help', lastUpdated: '2026-08-05', status: 'PUBLISHED' },
];

export const AdminCMS: React.FC = () => {
  const [pages] = useState<ICmsPage[]>(MOCK_PAGES);

  const columns: ColumnDef<ICmsPage>[] = [
    { id: 'title', label: 'PAGE TITLE' },
    { id: 'slug', label: 'SLUG / ROUTE' },
    { id: 'lastUpdated', label: 'LAST UPDATED' },
    { id: 'status', label: 'STATUS', render: (r) => <Chip label={r.status} color="success" size="small" sx={{ fontWeight: 800 }} /> },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Content Management System (CMS)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Edit platform policies, FAQs, landing banners, and dynamic content.
        </Typography>
      </Box>

      <AdminDataTable title="Static & Dynamic Pages" columns={columns} data={pages} />
    </Box>
  );
};

export default AdminCMS;
