import useAuthApi from '@/api/useAuthApi';
import { useAuthStore } from '@/store/auth-store';
import { Button, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function ButtonAppBar() {
  const { isAuthenticated, user } = useAuthStore();

  const { logout } = useAuthApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    }
  });

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to={'/'}
            sx={{ flexGrow: 1, color: (theme) => theme.palette.grey[50], textDecoration: 'none' }}
          >
            Table reservation
          </Typography>
          {isAuthenticated ? (
            <Stack direction={'row'}>
              <Button onClick={() => navigate('/auth')} sx={{ color: (theme) => theme.palette.grey[50] }}>
                {user ? `${user.name} (${user.role})` : `Account`}
              </Button>
              <Button onClick={() => logoutMutation.mutateAsync()} sx={{ color: (theme) => theme.palette.grey[50] }}>
                Signout
              </Button>
            </Stack>
          ) : (
            <Typography
              variant="h6"
              component={RouterLink}
              to={'/login'}
              sx={{ color: (theme) => theme.palette.grey[50], textDecoration: 'none' }}
            >
              Login
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
