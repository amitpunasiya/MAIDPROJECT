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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty } from '../components/common/AdminStateComponents';

interface CityRecord {
  id: string;
  name: string;
  state: string;
  country: string;
  activeProviders: number;
  isActive: boolean;
}

export const LocationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [newPincode, setNewPincode] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getLocations();
      const payload = res.data || res;
      const rawList = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.locations || [];

      const formatted: CityRecord[] = rawList.map((loc: any) => ({
        id: loc._id || loc.id,
        name: loc.city || loc.name || 'City',
        state: loc.state || 'State',
        country: loc.country || 'India',
        activeProviders: loc.activeProviders || loc.providersCount || 0,
        isActive: typeof loc.isActive === 'boolean' ? loc.isActive : loc.status === 'active',
      }));

      setCities(formatted);
    } catch (err: any) {
      setError(err?.message || 'Failed to load location data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLocations();
  }, []);

  const handleToggleCity = (id: string) => {
    setCities(cities.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleAddLocation = async () => {
    if (!newCityName || !newStateName) return;
    try {
      await adminApi.createLocation({
        city: newCityName.trim(),
        state: newStateName.trim(),
        pincode: newPincode.trim(),
        isActive: true,
      });
      setNewCityName('');
      setNewStateName('');
      setNewPincode('');
      setOpenModal(false);
      void fetchLocations();
    } catch (err: any) {
      alert(err?.message || 'Failed to add location.');
    }
  };

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            PAN India Location & City Expansion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage active service cities, state coverage, and add new service zones.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
          Add Service Location
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <TextField
          size="small"
          placeholder="Search city or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoading message="Fetching active service locations..." />
        ) : error ? (
          <AdminError message={error} onRetry={fetchLocations} />
        ) : filteredCities.length === 0 ? (
          <AdminEmpty title="No Service Locations" description="Click 'Add Service Location' to expand service coverage." />
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active Staff</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Service Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Toggle Service
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCities.map((city) => (
                <TableRow key={city.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{city.name}</TableCell>
                  <TableCell>{city.state}</TableCell>
                  <TableCell>{city.country}</TableCell>
                  <TableCell>{city.activeProviders} Staff</TableCell>
                  <TableCell>
                    <Chip
                      label={city.isActive ? 'SERVICE ACTIVE' : 'DISABLED'}
                      color={city.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Switch
                      checked={city.isActive}
                      onChange={() => handleToggleCity(city.id)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add Location Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Add Service Location</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="City Name (e.g. Bengaluru)" fullWidth size="small" value={newCityName} onChange={(e) => setNewCityName(e.target.value)} />
            <TextField label="State Name (e.g. Karnataka)" fullWidth size="small" value={newStateName} onChange={(e) => setNewStateName(e.target.value)} />
            <TextField label="Pincode (Optional)" fullWidth size="small" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLocation}>Save Location</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationManagement;
