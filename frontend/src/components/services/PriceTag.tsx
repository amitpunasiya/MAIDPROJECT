import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface PriceTagProps extends Omit<ChipProps, 'label'> {
  price: string | number;
  period?: string;
  isMonthly?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  period,
  isMonthly = false,
  color = isMonthly ? 'secondary' : 'primary',
  size = 'small',
  ...rest
}) => {
  const formattedPrice = typeof price === 'number' ? `₹${price}` : price;
  const labelText = period ? `${formattedPrice}/${period}` : formattedPrice;

  return (
    <Chip
      {...rest}
      label={labelText}
      color={color}
      size={size}
      sx={{
        fontWeight: 800,
        fontSize: size === 'small' ? '0.8rem' : '0.9rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        ...rest.sx,
      }}
    />
  );
};

export default PriceTag;
