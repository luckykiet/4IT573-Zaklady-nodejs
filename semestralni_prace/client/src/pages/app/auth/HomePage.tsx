import useReservationsApi from '@/api/useReservationsApi';

import { DAYS_OF_WEEK_SHORT } from '@/config';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export default function HomePage() {
  const { fetchOwnReservations } = useReservationsApi();
  const {
    isLoading,
    isFetching,
    error,
    isError,
    data: reservations
  } = useQuery({
    queryKey: ['own_reservations'],
    queryFn: () => fetchOwnReservations()
  });

  return (
    <Container maxWidth={'xl'}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">My reservations</Typography>
        </Grid>
        <Grid item xs={12}>
          {reservations && _.isArray(reservations) && !_.isEmpty(reservations) ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Tables</TableCell>
                    <TableCell>Opening Times</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>
                        {store.address.street}, {store.address.zip} {store.address.city}
                      </TableCell>
                      <TableCell>{store.type}</TableCell>
                      <TableCell>{store.tables.length}</TableCell>
                      <TableCell>
                        {store.openingTime.map((time, index) => (
                          <div key={index}>
                            {DAYS_OF_WEEK_SHORT[index]}: {time.isOpen ? `${time.start} - ${time.end}` : '(Closed)'}
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color={'error'} variant="h4" align="center">
              No store available
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
