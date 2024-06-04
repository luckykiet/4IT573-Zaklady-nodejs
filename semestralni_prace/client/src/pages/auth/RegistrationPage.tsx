import AuthRegistration from '@/components/AuthRegistration';
import { Grid, Stack, Typography } from '@mui/material';

import { Link } from 'react-router-dom';

// ================================|| LOGIN ||================================ //

const RegistrationPage = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
          <Typography variant="h3">Registration</Typography>
          <Typography component={Link} to={'/login'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
            Already have an account?
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <AuthRegistration />
      </Grid>
    </Grid>
  );
};

export default RegistrationPage;
