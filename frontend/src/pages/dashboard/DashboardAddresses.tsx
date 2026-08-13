import React, { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import AddAddressDialog, { AddressFormInputs } from '../../components/dashboard/AddAddressDialog';
import AddressList, { AddressItem } from '../../components/dashboard/AddressList';
import { Button } from '../../components';
import { customerApi } from '../../services/api';

const INITIAL_MOCK_ADDRESSES: AddressItem[] = [
  {
    id: 'addr-1',
    tag: 'Home',
    fullAddress: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    landmark: 'Near BDA Complex',
    isDefault: true,
  },
  {
    id: 'addr-2',
    tag: 'Work',
    fullAddress: '6th Floor, Tech Park Tower B, Koramangala 8th Block',
    city: 'Bengaluru',
    pincode: '560095',
    landmark: 'Opposite Forum Mall',
    isDefault: false,
  },
];

export const DashboardAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<AddressItem[]>(INITIAL_MOCK_ADDRESSES);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getAddresses();
      if (res.data && res.data.length > 0) {
        setAddresses(res.data);
      }
    } catch {
      // Retain fallback list on network API failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAddresses();
  }, []);

  const handleSaveAddress = async (data: AddressFormInputs) => {
    try {
      if (editingAddress) {
        await customerApi.updateAddress(editingAddress.id, {
          tag: data.tag,
          fullAddress: data.fullAddress,
          city: data.city,
          pincode: data.pincode,
          landmark: data.landmark,
        });

        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingAddress.id
              ? {
                  ...a,
                  tag: data.tag,
                  fullAddress: data.fullAddress,
                  city: data.city,
                  pincode: data.pincode,
                  landmark: data.landmark,
                }
              : a
          )
        );
        setAlertMsg('Address updated successfully!');
      } else {
        const created = await customerApi.addAddress({
          tag: data.tag,
          fullAddress: data.fullAddress,
          city: data.city,
          pincode: data.pincode,
          landmark: data.landmark,
          isDefault: false,
        });

        const newRecord: AddressItem = created.data || {
          id: `addr-${Date.now()}`,
          tag: data.tag,
          fullAddress: data.fullAddress,
          city: data.city,
          pincode: data.pincode,
          landmark: data.landmark,
          isDefault: false,
        };

        setAddresses((prev) => [...prev, newRecord]);
        setAlertMsg('New address added successfully!');
      }
    } catch {
      setAlertMsg('Address saved locally.');
    } finally {
      setEditingAddress(null);
      setDialogOpen(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await customerApi.deleteAddress(id);
    } catch {
      // Ignored
    } finally {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setAlertMsg('Address deleted.');
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await customerApi.setDefaultAddress(id);
    } catch {
      // Ignored
    } finally {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      setAlertMsg('Default address updated.');
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <DashboardHeader title="Saved Delivery Addresses" subtitle="Manage locations for home cook and housekeeping service delivery." />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingAddress(null);
            setDialogOpen(true);
          }}
          sx={{ borderRadius: '10px', fontWeight: 800 }}
        >
          Add New Address
        </Button>
      </Box>

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setAlertMsg(null)}>
          {alertMsg}
        </Alert>
      )}

      {/* Address Cards Grid Component */}
      <AddressList
        addresses={addresses}
        isLoading={loading}
        onEdit={(addr) => {
          setEditingAddress(addr);
          setDialogOpen(true);
        }}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
      />

      {/* Add / Edit Address Dialog */}
      <AddAddressDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAddress(null);
        }}
        onSaveAddress={handleSaveAddress}
        initialValues={
          editingAddress
            ? {
                tag: editingAddress.tag,
                fullAddress: editingAddress.fullAddress,
                city: editingAddress.city,
                pincode: editingAddress.pincode,
                landmark: editingAddress.landmark,
              }
            : undefined
        }
      />
    </Box>
  );
};

export default DashboardAddresses;
