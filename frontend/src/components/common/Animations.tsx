import React from 'react';
import { Fade, Slide, Zoom, Box, BoxProps } from '@mui/material';

export interface AnimationProps {
  children: React.ReactElement;
  in?: boolean;
  timeout?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FadeIn: React.FC<AnimationProps> = ({ children, in: inProp = true, timeout = 500 }) => {
  return (
    <Fade in={inProp} timeout={timeout}>
      {children}
    </Fade>
  );
};

export const SlideIn: React.FC<AnimationProps> = ({
  children,
  in: inProp = true,
  timeout = 500,
  direction = 'up',
}) => {
  return (
    <Slide in={inProp} timeout={timeout} direction={direction}>
      {children}
    </Slide>
  );
};

export const ZoomIn: React.FC<AnimationProps> = ({ children, in: inProp = true, timeout = 400 }) => {
  return (
    <Zoom in={inProp} timeout={timeout}>
      {children}
    </Zoom>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        animation: 'fadeIn 0.35s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {children}
    </Box>
  );
};

export const HoverCard: React.FC<BoxProps> = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.15)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
