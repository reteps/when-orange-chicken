import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      // orange and green play nicely together.
      main: '#FF9B42',
    },
    secondary: {
      main: '#00A7E1',
    },
  },
});

export default function CustomTheme({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
