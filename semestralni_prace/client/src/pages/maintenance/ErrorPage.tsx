import { Box, Button, Grid, Stack, Typography, useMediaQuery } from '@mui/material';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import error404 from '@/assets/images/maintenance/img-error-404.svg';
import error500 from '@/assets/images/maintenance/img-error-500.svg';
import { useTheme } from '@mui/material/styles';

// ==============================|| ERROR 404 ||============================== //

const Error404 = ({ message }: { message: string }) => {
  return (
    <>
      <Grid
        container
        spacing={10}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh', pt: 2, pb: 1, overflow: 'hidden' }}
      >
        <Grid item xs={12}>
          <Stack direction="row">
            <Grid item>
              <Box sx={{ width: { xs: 250, sm: 590 }, height: { xs: 130, sm: 300 } }}>
                <img src={error404} alt="error 404" style={{ width: '100%', height: '100%' }} />
              </Box>
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="h1">Page not found</Typography>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
              {message}
            </Typography>
            <Button component={Link} to={'/'} variant="contained">
              Back to App
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

// ==============================|| ERROR 500 ||============================== //
const Error500 = ({ message }: { message: string }) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }} spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ width: 325 }}>
          <img src={error500} alt="error 500" style={{ height: '100%', width: '100%' }} />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack justifyContent="center" alignItems="center">
          <Typography align="center" variant={matchDownSM ? 'h2' : 'h1'}>
            Error
          </Typography>
          <Typography color="textSecondary" variant="body1" align="center" sx={{ width: { xs: '73%', sm: '70%' }, mt: 1 }}>
            {message}
          </Typography>
          <Button component={Link} to={'/'} variant="contained" sx={{ textTransform: 'none', mt: 4 }}>
            Back to App
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

const ErrorPage = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <Error404 message={`${error.status} - Page not found!`} />;
    }

    if (error.status === 401) {
      return <Error404 message={`${error.status} - No permission!`} />;
    }

    if (error.status === 503) {
      return <Error500 message={`${error.status} - Server failed!`} />;
    }

    if (error.status === 418) {
      return <>🫖</>;
    }
  }

  return <Error500 message={error instanceof Error ? error.message : `Unknown error!`} />;
};

export default ErrorPage;
