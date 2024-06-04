import { Box, Container } from '@mui/material';

import Footer from './Footer';
import Header from './Header';

import RootLayout from '@/layouts/RootLayout';
import { Outlet } from 'react-router-dom';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  return (
    <RootLayout>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Header />
          <Container
            maxWidth={'xl'}
            sx={{
              mt: 10,
              position: 'relative',
              minHeight: 'calc(100vh - 110px)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Outlet />
            <Footer />
          </Container>
        </Box>
      </Box>
    </RootLayout>
  );
};

export default MainLayout;
