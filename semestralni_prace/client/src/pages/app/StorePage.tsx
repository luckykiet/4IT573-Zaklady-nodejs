import useStoreApi from '@/api/useStoresApi';
import AddReservation from '@/components/AddReservationDialog';

import { DAYS_OF_WEEK_SHORT } from '@/config';
import { Table } from '@/types/api/table';
import { Container, Grid, Stack, Typography, Divider, Dialog, Button } from '@mui/material';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import { useState } from 'react';

import { useParams } from 'react-router-dom';

dayjs.extend(utc);

export default function StorePage() {
  const { storeId } = useParams();

  const { fetchGuestStore } = useStoreApi();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const today = dayjs();
  const { isLoading, data: store } = useQuery({
    queryKey: [
      'store',
      {
        id: storeId || ''
      }
    ],
    queryFn: () => fetchGuestStore({ id: storeId || '' })
  });

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOpen = (table: Table) => {
    setDialogOpen(true);
    setSelectedTable(table);
  };

  return (
    <Container maxWidth={'xl'}>
      {isLoading ? (
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      ) : store ? (
        <Grid container spacing={3}>
          {selectedTable && (
            <Grid item xs={12}>
              <Dialog
                maxWidth="sm"
                keepMounted
                fullWidth
                onClose={handleClose}
                open={dialogOpen}
                sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
              >
                <AddReservation table={selectedTable} onCancel={handleClose} />
              </Dialog>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="h5">Store: {store.name}</Typography>
              <Typography variant="h6">{store.address.street}</Typography>
              <Typography variant="h6">
                {store.address.zip} {store.address.city}
              </Typography>
              <Typography variant="h6">{store.address.country}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5">Opening time:</Typography>
            {store.openingTime.map((day, index) => {
              return (
                <Typography sx={{ fontWeight: today.day() === index ? 'bold' : 'normal' }} key={index} variant="h5">
                  {DAYS_OF_WEEK_SHORT[index]}: {!day.isOpen ? 'Closed' : `${day.start} - ${day.end}`}
                </Typography>
              );
            })}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">Tables</Typography>
          </Grid>

          {store.tables && store.tables.length > 0 ? (
            store.tables.map((table) => {
              return (
                <Grid key={table._id} item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Button variant="outlined" onClick={() => handleOpen(table)}>
                      Create an reservation
                    </Button>
                    <Typography>Name: {table.name}</Typography>
                    <Typography>Number of person: {table.person}</Typography>
                  </Stack>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                No table
              </Typography>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography color={'error'} align="center" variant="h5">
          Store not found
        </Typography>
      )}
    </Container>
  );
}
