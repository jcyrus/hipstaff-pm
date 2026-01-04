import React from 'react';
import { Skeleton, Stack } from '@mui/material';

type Props = {
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
};

const LoadingSkeleton = ({ variant = 'rectangular', width = '100%', height = 40, count = 1, className }: Props) => {
  if (count > 1) {
    return (
      <Stack spacing={1} className={className}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={`skeleton-${index}-${count}`} variant={variant} width={width} height={height} animation="wave" />
        ))}
      </Stack>
    );
  }

  return (
    <Skeleton variant={variant} width={width} height={height} animation="wave" className={className} />
  );
};

export default LoadingSkeleton;
