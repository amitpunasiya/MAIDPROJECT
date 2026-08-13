import React, { useId } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type AppInputProps = TextFieldProps;

export const Input: React.FC<AppInputProps> = ({
  variant = 'outlined',
  fullWidth = true,
  size = 'medium',
  id: customId,
  helperText,
  error,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const helperTextId = helperText ? `${inputId}-helper-text` : undefined;

  return (
    <TextField
      id={inputId}
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      error={error}
      helperText={helperText}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={helperTextId}
      slotProps={{
        formHelperText: { id: helperTextId },
      }}
      {...props}
    />
  );
};

export default Input;
