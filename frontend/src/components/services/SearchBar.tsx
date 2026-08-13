import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  onSearchSubmit,
  placeholder = 'Search by skill, cook, maid, or location...',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleClear = () => {
    if (onClear) onClear();
    else onChange('');
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3.5,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      }}
    >
      <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
      <InputBase
        sx={{ ml: 1, flex: 1, fontWeight: 500, fontSize: '0.95rem' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <IconButton size="small" onClick={handleClear} sx={{ color: 'text.secondary' }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;
