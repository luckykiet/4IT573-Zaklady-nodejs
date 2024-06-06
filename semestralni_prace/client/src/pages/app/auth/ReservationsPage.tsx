import useReservationsApi from '@/api/useReservationsApi';

import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
dayjs.extend(utc);

export default function ReservationsPage() {
  const { fetchAllStoresReservations } = useReservationsApi();
  const navigate = useNavigate();
  const { isLoading, isFetching, error, isError, data } = useQuery({
    queryKey: ['stores_reservations'],
    queryFn: () => fetchAllStoresReservations()
  });

  const now = dayjs.utc();

  return (
    <Container maxWidth={'xl'}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Reservation of my stores</Typography>
        </Grid>
        <Grid item xs={12}>
          {data?.reservations && _.isArray(data.reservations) && !_.isEmpty(data.reservations) ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell>Table</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.reservations.map((reservation) => {
                    const store = data.stores ? data.stores.find((s) => s._id === reservation.storeId) : null;
                    const table = store ? store?.tables?.find((t) => t._id === reservation.tableId) : null;
                    const isExpired = dayjs.utc(reservation.end).isBefore(now);
                    return (
                      <TableRow key={reservation._id}>
                        <TableCell onClick={() => navigate(`/auth/store/${reservation.storeId}`)}>
                          {store ? store.name : reservation.storeId}
                        </TableCell>
                        <TableCell onClick={() => navigate(`/auth/table/${reservation.tableId}`)}>
                          {table ? table.name : reservation.tableId}
                        </TableCell>
                        <TableCell>{reservation.name}</TableCell>
                        <TableCell>{reservation.email}</TableCell>
                        <TableCell>
                          {reservation.start} - {reservation.end}
                        </TableCell>
                        <TableCell>{reservation.isCancelled ? 'Cancelled' : isExpired ? 'Expired' : 'Incoming'}</TableCell>
                      </TableRow>
                    );
                  })}
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
