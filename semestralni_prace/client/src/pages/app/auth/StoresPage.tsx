import useStoreApi from '@/api/useStoresApi';
import { DAYS_OF_WEEK_SHORT } from '@/config';
import {
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

export default function StoresPage() {
  const navigate = useNavigate();
  const { fetchOwnStores } = useStoreApi();
  const {
    isLoading,
    isFetching,
    data: stores
  } = useQuery({
    queryKey: ['own_stores'],
    queryFn: () => fetchOwnStores()
  });

  return (
    <Container maxWidth={'xl'}>
      {isLoading || isFetching ? (
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h5">My stores</Typography>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="warning" onClick={() => navigate('/auth/store')}>
              Add store
            </Button>
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
                        <TableCell onClick={() => navigate(`/auth/store/${store._id}`)}>{store.name}</TableCell>
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
      )}
    </Container>
  );
}
