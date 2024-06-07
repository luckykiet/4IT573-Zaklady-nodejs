import useReservationsApi from '@/api/useReservationsApi';
import { Container, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const CancelPage = () => {
  const { token } = useParams();
  const { cancelReservation } = useReservationsApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');
  const cancelReservationMutation = useMutation({
    mutationFn: (data: { token: string }) => cancelReservation(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Reservation cancelled');
    }
  });

  useEffect(() => {
    if (token) {
      cancelReservationMutation.mutateAsync({ token });
    }
  }, [token]);

  return (
    <Container maxWidth={'xl'}>
      {postMsg && (
        <Typography variant="h5" align="center" color={postMsg instanceof Error ? 'error' : 'success'}>
          {postMsg instanceof Error ? postMsg.message : postMsg}
        </Typography>
      )}
    </Container>
  );
};

export default CancelPage;
