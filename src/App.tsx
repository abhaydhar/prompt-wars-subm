import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useStudentStore } from './store/useStudentStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const profile = useStudentStore((state) => state.profile);

  // If student hasn't completed onboarding, show accessibility setup
  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Onboarding />
      </Box>
    );
  }

  // Otherwise, show the main dashboard
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Dashboard />
    </Box>
  );
};

export default App;
