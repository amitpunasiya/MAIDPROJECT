import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid2,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';

export interface KycFormData {
  countryCode: string;
  documentType: 'aadhaar' | 'ssn_id' | 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
  documentFrontDoc: string;
  documentBackDoc?: string;
  selfiePhotoDoc?: string;
}

interface CountryOption {
  code: string;
  name: string;
  docTypes: { type: KycFormData['documentType']; label: string; placeholder: string }[];
}

const COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India 🇮🇳',
    docTypes: [
      { type: 'aadhaar', label: 'Aadhaar Card (Government ID)', placeholder: 'e.g. 1234 5678 9012' },
      { type: 'drivers_license', label: 'Driving Licence', placeholder: 'e.g. KA0120200001234' },
      { type: 'passport', label: 'Indian Passport', placeholder: 'e.g. Z1234567' },
    ],
  },
  {
    code: 'US',
    name: 'United States 🇺🇸',
    docTypes: [
      { type: 'drivers_license', label: "State Driver's License", placeholder: 'e.g. D1234567' },
      { type: 'ssn_id', label: 'State Issued ID Card', placeholder: 'e.g. S9876543' },
      { type: 'passport', label: 'US Passport', placeholder: 'e.g. 990011223' },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom 🇬🇧',
    docTypes: [
      { type: 'drivers_license', label: 'UK Driving Licence', placeholder: 'e.g. SMITH901019AB99' },
      { type: 'passport', label: 'UK Passport', placeholder: 'e.g. 500123456' },
      { type: 'national_id', label: 'National Insurance ID', placeholder: 'e.g. QQ123456C' },
    ],
  },
  {
    code: 'CA',
    name: 'Canada 🇨🇦',
    docTypes: [
      { type: 'drivers_license', label: "Provincial Driver's License", placeholder: 'e.g. A1234-56789-01234' },
      { type: 'passport', label: 'Canadian Passport', placeholder: 'e.g. AA123456' },
      { type: 'national_id', label: 'Provincial ID Card', placeholder: 'e.g. ID987654' },
    ],
  },
  {
    code: 'AU',
    name: 'Australia 🇦🇺',
    docTypes: [
      { type: 'drivers_license', label: "State Driver's Licence", placeholder: 'e.g. 98765432' },
      { type: 'passport', label: 'Australian Passport', placeholder: 'e.g. N1234567' },
    ],
  },
  {
    code: 'OTHER',
    name: 'Other Country 🌐',
    docTypes: [
      { type: 'national_id', label: 'National Government ID', placeholder: 'Enter official document number' },
      { type: 'passport', label: 'International Passport', placeholder: 'Enter passport number' },
      { type: 'drivers_license', label: 'Driving Licence', placeholder: 'Enter license number' },
    ],
  },
];

interface CountryAwareKycFormProps {
  onSubmitKyc: (data: KycFormData) => Promise<void>;
  currentStatus?: string;
}

export const CountryAwareKycForm: React.FC<CountryAwareKycFormProps> = ({ onSubmitKyc, currentStatus }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedDocType, setSelectedDocType] = useState<KycFormData['documentType']>('aadhaar');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [documentFrontDoc, setDocumentFrontDoc] = useState<string>('');
  const [documentBackDoc, setDocumentBackDoc] = useState<string>('');
  const [selfiePhotoDoc, setSelfiePhotoDoc] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentCountry = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
  const currentDocTypeObj = currentCountry.docTypes.find((d) => d.type === selectedDocType) || currentCountry.docTypes[0];

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const countryObj = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
    setSelectedDocType(countryObj.docTypes[0].type);
  };

  const handleFileUpload = (setter: (url: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!documentNumber.trim()) {
      setErrorMsg('Document number is required.');
      return;
    }

    setLoading(true);
    try {
      await onSubmitKyc({
        countryCode: selectedCountryCode,
        documentType: selectedDocType,
        documentNumber: documentNumber.trim(),
        documentFrontDoc: documentFrontDoc || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
        documentBackDoc,
        selfiePhotoDoc,
      });
      setSuccessMsg('KYC documents submitted successfully! Your profile is now under admin verification review.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit KYC documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Provider Identity & Background Verification
          </Typography>
        </Box>
        {currentStatus && (
          <Chip
            icon={<VerifiedUserIcon />}
            label={`STATUS: ${currentStatus.toUpperCase()}`}
            color={
              currentStatus.toUpperCase() === 'APPROVED' || currentStatus.toUpperCase() === 'VERIFIED'
                ? 'success'
                : currentStatus.toUpperCase() === 'UNDER_REVIEW'
                ? 'warning'
                : currentStatus.toUpperCase() === 'PERMANENTLY_BLOCKED'
                ? 'error'
                : 'default'
            }
            sx={{ fontWeight: 800, fontSize: '0.75rem' }}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload your government-issued identity documents. Documents are securely encrypted and verified confidentially by our compliance team.
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid2 container spacing={2.5}>
          {/* Country Selection */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              SELECT COUNTRY OF ISSUANCE
            </Typography>
            <Select
              fullWidth
              size="small"
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </Grid2>

          {/* Document Type Selection */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              IDENTITY DOCUMENT TYPE
            </Typography>
            <Select
              fullWidth
              size="small"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as KycFormData['documentType'])}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {currentCountry.docTypes.map((d) => (
                <MenuItem key={d.type} value={d.type}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </Grid2>

          {/* Document Number */}
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              DOCUMENT IDENTIFICATION NUMBER
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={currentDocTypeObj.placeholder}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Grid2>

          {/* Document Upload Front, Back & Selfie */}
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2.5,
                borderStyle: 'dashed',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" fontWeight={800} display="block" sx={{ mb: 1 }}>
                Document Front (Photo ID)
              </Typography>
              <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                Upload Front
                <input type="file" hidden accept="image/*,.pdf" onChange={handleFileUpload(setDocumentFrontDoc)} />
              </Button>
              {documentFrontDoc && (
                <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                  ✓ File Attached
                </Typography>
              )}
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2.5,
                borderStyle: 'dashed',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" fontWeight={800} display="block" sx={{ mb: 1 }}>
                Document Back (Address)
              </Typography>
              <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                Upload Back
                <input type="file" hidden accept="image/*,.pdf" onChange={handleFileUpload(setDocumentBackDoc)} />
              </Button>
              {documentBackDoc && (
                <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                  ✓ File Attached
                </Typography>
              )}
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2.5,
                borderStyle: 'dashed',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="caption" fontWeight={800} display="block" sx={{ mb: 1 }}>
                Selfie Verification Photo
              </Typography>
              <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                Upload Selfie
                <input type="file" hidden accept="image/*" onChange={handleFileUpload(setSelfiePhotoDoc)} />
              </Button>
              {selfiePhotoDoc && (
                <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                  ✓ Selfie Attached
                </Typography>
              )}
            </Paper>
          </Grid2>
        </Grid2>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <VerifiedUserIcon />}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
          >
            {loading ? 'Submitting...' : 'Submit KYC for Admin Approval'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CountryAwareKycForm;
