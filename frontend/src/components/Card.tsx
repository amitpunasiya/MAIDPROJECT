import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';

export interface AppCardProps extends MuiCardProps {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<AppCardProps> = ({
  children,
  hoverable = true,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      sx={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...(hoverable && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.12)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};

export default Card;
