import AuthLogin from '@/components/AuthLogin';
import { Grid, Stack, Typography } from '@mui/material';

import { Link } from 'react-router-dom';

// ================================|| LOGIN ||================================ //

const LoginPage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
          <Typography variant="h3">Login</Typography>
          <Typography component={Link} to={'/registration'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
            Don't have account?
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <AuthLogin />
      </Grid>
    </Grid>
  );
};

export default LoginPage;
