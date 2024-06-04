import useStoreApi from '@/api/useStoresApi';
import { DAYS_OF_WEEK_SHORT } from '@/config';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export default function HomePage() {
  const { fetchGuestStores } = useStoreApi();
  const {
    isLoading,
    isFetching,
    error,
    isError,
    data: stores
  } = useQuery({
    queryKey: ['guest_stores'],
    queryFn: () => fetchGuestStores()
  });

  return (
    <Container maxWidth={'xl'}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Homepage</Typography>
        </Grid>
        <Grid item xs={12}>
          {stores && _.isArray(stores) && !_.isEmpty(stores) ? (
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
                  {stores.map((store) => (
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
