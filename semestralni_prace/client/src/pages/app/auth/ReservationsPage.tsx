import useReservationsApi from '@/api/useReservationsApi';

import { DAYS_OF_WEEK_SHORT } from '@/config';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export default function ReservationsPage() {
  const { fetchAllStoresReservations } = useReservationsApi();
  const {
    isLoading,
    isFetching,
    error,
    isError,
    data: reservations
  } = useQuery({
    queryKey: ['stores_reservations'],
    queryFn: () => fetchAllStoresReservations()
  });
  console.log(reservations);
  return (
    <Container maxWidth={'xl'}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Reservation of my stores</Typography>
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
                  {reservations.map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell>{reservation.name}</TableCell>
                      <TableCell>
                        {reservation.address.street}, {reservation.address.zip} {reservation.address.city}
                      </TableCell>
                      <TableCell>{reservation.type}</TableCell>
                      <TableCell>{reservation.tables.length}</TableCell>
                      <TableCell>
                        {reservation.openingTime.map((time, index) => (
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
              No reservations available
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
