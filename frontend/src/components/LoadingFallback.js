import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="textSecondary">
      Loading component...
    </Typography>
  </Box>
);

export default LoadingFallback;
