import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty } from '../components/common/AdminStateComponents';

interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  isFeatured: boolean;
  isActive: boolean;
}

export const ServiceManagement: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Cleaning');
  const [newDuration, setNewDuration] = useState('30');
  const [verificationRequired, setVerificationRequired] = useState(false);

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCategories();
      const payload = res.data || res;
      const categoriesList = Array.isArray(payload) ? payload : payload.categories || payload.items || [];

      const formatted: ServiceRecord[] = [];
      categoriesList.forEach((cat: any) => {
        if (Array.isArray(cat.services) && cat.services.length > 0) {
          cat.services.forEach((s: any) => {
            formatted.push({
              id: s._id || s.id,
              name: s.name || s.title || 'Service',
              category: cat.name || cat.title || 'General',
              price: s.basePrice || s.price || 150,
              isFeatured: typeof s.isFeatured === 'boolean' ? s.isFeatured : true,
              isActive: typeof s.isActive === 'boolean' ? s.isActive : true,
            });
          });
        } else {
          formatted.push({
            id: cat._id || cat.id,
            name: cat.name || 'Category Offering',
            category: cat.type || 'Catalog',
            price: cat.basePrice || 200,
            isFeatured: true,
            isActive: true,
          });
        }
      });

      setServices(formatted);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch catalog from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCatalog();
  }, []);

  const handleToggleActive = (id: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const handleToggleFeatured = (id: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, isFeatured: !s.isFeatured } : s)));
  };

  const handleAddService = async () => {
    if (newServiceName && newServicePrice) {
      try {
        await adminApi.createService({
          name: newServiceName,
          categoryName: newServiceCategory,
          basePrice: Number(newServicePrice),
          estimatedDurationMinutes: Number(newDuration) || 30,
          verificationRequired,
        });
        setNewServiceName('');
        setNewServicePrice('');
        setOpenModal(false);
        void fetchCatalog();
      } catch (err: any) {
        alert(err?.message || 'Failed to save service entry.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Service & Category Catalog Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure service offerings, task-based base pricing, categories, and homepage featured listings.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
          Add New Service / Task
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoading message="Loading catalog services..." />
        ) : error ? (
          <AdminError message={error} onRetry={fetchCatalog} />
        ) : services.length === 0 ? (
          <AdminEmpty title="Catalog Empty" description="Click 'Add New Service / Task' to add entries into the catalog." />
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Service / Task Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Base Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Toggle Active
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{service.name}</TableCell>
                  <TableCell>
                    <Chip label={service.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>₹{service.price}</TableCell>
                  <TableCell>
                    <Switch
                      checked={service.isFeatured}
                      onChange={() => handleToggleFeatured(service.id)}
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'ACTIVE' : 'DISABLED'}
                      color={service.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Switch
                      checked={service.isActive}
                      onChange={() => handleToggleActive(service.id)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add Service / Task Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Add New Task Service</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Task / Service Name" fullWidth size="small" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
            <TextField label="Category (e.g. Cleaning, Kitchen, Laundry, Care)" fullWidth size="small" value={newServiceCategory} onChange={(e) => setNewServiceCategory(e.target.value)} />
            <TextField label="Base Price (₹)" type="number" fullWidth size="small" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} />
            <TextField label="Est. Duration (mins)" type="number" fullWidth size="small" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={600}>
                Requires Verified Staff Only
              </Typography>
              <Switch checked={verificationRequired} onChange={(e) => setVerificationRequired(e.target.checked)} color="success" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddService}>Save Task Service</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceManagement;
