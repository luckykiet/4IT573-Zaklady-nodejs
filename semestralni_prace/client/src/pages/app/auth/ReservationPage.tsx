import useReservationsApi from '@/api/useReservationsApi';

import { Container, Grid, Typography, Button, Stack, FormHelperText } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
dayjs.extend(utc);

export default function ReservationPage() {
  const { reservationId } = useParams();
  const { fetchReservation, cancelMerchantReservation } = useReservationsApi();
  const now = dayjs();
  const navigate = useNavigate();
  const [postMsg, setPostMsg] = useState<string | Error>('');

  const { isLoading, data: reservation } = useQuery({
    queryKey: ['reservation', { id: reservationId || '' }],
    queryFn: () => fetchReservation({ id: reservationId || '' }),
    enabled: !_.isEmpty(reservationId)
  });

  const sendCancelMutation = useMutation({
    mutationFn: (id: string) => cancelMerchantReservation({ id }),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      navigate('/auth/reservations');
    }
  });
  return (
    <Container maxWidth={'xl'}>
      {isLoading ? (
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      ) : reservation ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Typography variant="h5">Reservation: {reservationId}</Typography>
              <Typography variant="h6">
                Customer: {reservation.name} ({reservation.email})
              </Typography>
              <Typography variant="h6">Store: {reservation.store ? reservation.store.name : reservation.storeId}</Typography>
              {reservation.store && <Typography variant="h6">{reservation.store.address.street}</Typography>}
              {reservation.store && (
                <Typography variant="h6">
                  {reservation.store.address.zip} {reservation.store.address.city}
                </Typography>
              )}
              <Typography variant="h6">Table: {reservation.table ? reservation.table.name : reservation.storeId}</Typography>
              {reservation.table && <Typography variant="h6">Size: {reservation.table.person}</Typography>}
              <Typography variant="h6">
                Time: {dayjs(reservation.start).format('DD/MM/YYYY')} {dayjs(reservation.start).format('HH:mm')} -{' '}
                {dayjs(reservation.end).format('HH:mm')}
              </Typography>
              <Typography variant="h6">
                Status: {reservation.isCancelled ? 'Cancelled' : dayjs(reservation.end).isBefore(now) ? 'Expired' : 'Incoming'}
              </Typography>
            </Stack>
          </Grid>
          {postMsg && (
            <Grid item xs={12}>
              <FormHelperText error={postMsg instanceof Error}>{postMsg instanceof Error ? postMsg.message : postMsg}</FormHelperText>
            </Grid>
          )}
          {!dayjs(reservation.end).isBefore(now) && !reservation.isCancelled && (
            <Grid item xs={12}>
              <Button onClick={() => sendCancelMutation.mutateAsync(reservation._id)} variant="contained" color="error">
                Cancel
              </Button>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography>No reservation found</Typography>
      )}
    </Container>
  );
}
