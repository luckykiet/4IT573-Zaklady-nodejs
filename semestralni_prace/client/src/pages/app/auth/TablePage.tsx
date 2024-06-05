import useTableApi from '@/api/useTablesApi';

import { TableFormMutation, TableForm } from '@/types/forms/table';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Container,
  FormHelperText,
  Grid,
  Stack,
  Typography,
  InputLabel,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Button
} from '@mui/material';

import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

dayjs.extend(utc);

const tableSchema = z.object({
  name: z.string({ required_error: 'Required' }).min(3).max(255),
  person: z.coerce.number({ required_error: 'Required' }).gte(1),
  isAvailable: z.boolean()
});

export default function TablePage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { fetchTable, deleteTable, updateTable } = useTableApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');

  const mainUseForm = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: '',
      person: 1,
      isAvailable: false
    },
    mode: 'all'
  });

  const {
    isLoading,
    data: table,
    refetch
  } = useQuery({
    queryKey: [
      'own_table',
      {
        id: tableId || ''
      }
    ],
    queryFn: () => fetchTable({ id: tableId || '' })
  });

  const { control, handleSubmit, reset } = mainUseForm;

  const updateTableMutation = useMutation({
    mutationFn: (data: TableFormMutation) => updateTable(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Table updated');
      refetch();
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => deleteTable({ id }),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Table deleted');
      navigate(table ? `/auth/store/${table.storeId}` : '/auth/stores');
    }
  });

  const onSubmit: SubmitHandler<TableFormMutation> = async (data) => {
    try {
      if (!tableId) {
        throw 'no table id';
      }

      updateTableMutation.mutateAsync({ ...data, tableId });
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (table) {
      reset(table);
    }
  }, [table]);

  return (
    <Container maxWidth={'xl'}>
      {isLoading ? (
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      ) : table ? (
        <FormProvider {...mainUseForm}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5">Table: {tableId}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Name</InputLabel>
                      <OutlinedInput
                        {...field}
                        type="text"
                        placeholder="abcdef"
                        fullWidth
                        error={Boolean(fieldState.isTouched && fieldState.invalid)}
                      />
                      {fieldState.isTouched && fieldState.invalid && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
                    </Stack>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="person"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Number of person</InputLabel>
                      <OutlinedInput
                        {...field}
                        type="number"
                        placeholder="1"
                        fullWidth
                        error={Boolean(fieldState.isTouched && fieldState.invalid)}
                      />
                      {fieldState.isTouched && fieldState.invalid && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
                    </Stack>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="isAvailable"
                  control={control}
                  render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label={'Is available'} />}
                />
              </Grid>

              {postMsg && (
                <Grid item xs={12}>
                  <FormHelperText error={postMsg instanceof Error}>{postMsg instanceof Error ? postMsg.message : postMsg}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={6}>
                <Button
                  disableElevation
                  disabled={updateTableMutation.isPending}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Update table
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  disabled={deleteTableMutation.isPending}
                  variant="contained"
                  color="error"
                  onClick={() => deleteTableMutation.mutateAsync(table._id)}
                >
                  Delete table
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={() => navigate(`/auth/store/${table.storeId}`)}>
                  Back to store
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      ) : (
        <Typography color={'error'} align="center" variant="h5">
          Table not found
        </Typography>
      )}
    </Container>
  );
}
