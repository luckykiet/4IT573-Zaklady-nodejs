import useStoreApi from '@/api/useStoresApi';
import useTableApi from '@/api/useTablesApi';
import { DAYS_OF_WEEK, STORES_TYPES } from '@/config';

import { StoreForm, StoreFormMutation } from '@/types/forms/store';
import { NewTableFormMutation } from '@/types/forms/table';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Container,
  FormHelperText,
  Grid,
  Stack,
  Typography,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Button,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';

import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

dayjs.extend(utc);

const storeSchema = z.object({
  name: z.string({ required_error: 'Required' }).min(3).max(255),
  address: z.object({
    street: z.string({ required_error: 'Required' }).min(3).max(255),
    city: z.string({ required_error: 'Required' }).min(2).max(255),
    zip: z.string({ required_error: 'Required' }).min(3).max(255),
    country: z.string({ required_error: 'Required' }).min(3).max(255)
  }),
  type: z.enum(STORES_TYPES),
  openingTime: z
    .array(
      z.object({
        start: z.string({ required_error: 'Required' }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string({ required_error: 'Required' }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        isOpen: z.boolean()
      })
    )
    .length(7),
  isAvailable: z.boolean()
});

export default function StorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { fetchOwnStore, updateStore, deleteStore } = useStoreApi();
  const { addNewTable, deleteTable } = useTableApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');

  const mainUseForm = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: import.meta.env.MODE === 'development' ? 'Gastro' : '',
      address: {
        street: import.meta.env.MODE === 'development' ? 'Street 123' : '',
        city: import.meta.env.MODE === 'development' ? 'Praha' : '',
        zip: import.meta.env.MODE === 'development' ? '11000' : '',
        country: 'Czech republic'
      },
      type: 'bistro',
      isAvailable: false,
      openingTime: []
    },
    mode: 'all'
  });

  const {
    isLoading,
    data: store,
    refetch
  } = useQuery({
    queryKey: [
      'own_store',
      {
        id: storeId || ''
      }
    ],
    queryFn: () => fetchOwnStore({ id: storeId || '' })
  });

  const { control, handleSubmit, reset, watch } = mainUseForm;

  const { fields: timeFields } = useFieldArray({
    control,
    name: 'openingTime'
  });

  const updateStoreMutation = useMutation({
    mutationFn: (data: StoreFormMutation) => updateStore(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Store updated');
      refetch();
    }
  });

  const addTableMutation = useMutation({
    mutationFn: (data: NewTableFormMutation) => addNewTable(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Table added');
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
      refetch();
    }
  });

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => deleteStore({ id }),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: () => {
      setPostMsg('Store deleted');
      navigate('/auth/stores');
    }
  });

  const onSubmit: SubmitHandler<StoreFormMutation> = async (data) => {
    try {
      if (!storeId) {
        throw 'no store id';
      }

      updateStoreMutation.mutateAsync({ ...data, storeId });
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (store) {
      reset(store);
    }
  }, [store]);

  return (
    <Container maxWidth={'xl'}>
      {isLoading ? (
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      ) : store ? (
        <FormProvider {...mainUseForm}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5">Store: {storeId}</Typography>
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
                  name="address.street"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Street</InputLabel>
                      <OutlinedInput
                        {...field}
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
                  name="address.city"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>City</InputLabel>
                      <OutlinedInput
                        {...field}
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
                  name="address.zip"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Zip</InputLabel>
                      <OutlinedInput
                        {...field}
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
                  name="address.country"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Zip</InputLabel>
                      <OutlinedInput
                        {...field}
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
                  name="type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <InputLabel htmlFor={field.name}>Type</InputLabel>
                      <Select
                        {...field}
                        size={'medium'}
                        error={fieldState.invalid}
                        sx={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'pre'
                        }}
                      >
                        {STORES_TYPES.map((type) => {
                          return (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          );
                        })}
                      </Select>
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
              <Grid item xs={12}>
                <Divider />
              </Grid>
              {timeFields.map((day, index) => {
                return (
                  <Grid key={day.id} item xs={12}>
                    <Stack spacing={1}>
                      <Typography variant="h5">{DAYS_OF_WEEK[index]}</Typography>
                      <Controller
                        name={`openingTime.${index}.start`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Stack spacing={1}>
                            <InputLabel htmlFor={field.name}>Start</InputLabel>
                            <TimePicker
                              {...field}
                              inputRef={field.ref}
                              onChange={(day) => {
                                field.onChange(day?.format('HH:mm'));
                              }}
                              value={
                                dayjs.isDayjs(field.value)
                                  ? field.value
                                  : dayjs(field.value, 'HH:mm', true).isValid()
                                  ? dayjs(field.value, 'HH:mm')
                                  : null
                              }
                              sx={{ width: '100%' }}
                              views={['hours', 'minutes']}
                              format="HH:mm"
                            />

                            {fieldState.isTouched && fieldState.invalid && (
                              <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                            )}
                          </Stack>
                        )}
                      />
                      <Controller
                        name={`openingTime.${index}.end`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Stack spacing={1}>
                            <InputLabel htmlFor={field.name}>End</InputLabel>
                            <TimePicker
                              {...field}
                              inputRef={field.ref}
                              onChange={(day) => {
                                field.onChange(day?.format('HH:mm'));
                              }}
                              value={
                                dayjs.isDayjs(field.value)
                                  ? field.value
                                  : dayjs(field.value, 'HH:mm', true).isValid()
                                  ? dayjs(field.value, 'HH:mm')
                                  : null
                              }
                              sx={{ width: '100%' }}
                              views={['hours', 'minutes']}
                              format="HH:mm"
                            />
                            {fieldState.isTouched && fieldState.invalid && (
                              <FormHelperText error>{fieldState.error?.message}</FormHelperText>
                            )}
                          </Stack>
                        )}
                      />
                      <Controller
                        name={`openingTime.${index}.isOpen`}
                        control={control}
                        render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label={'Is open'} />}
                      />
                    </Stack>
                  </Grid>
                );
              })}
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5">Tables</Typography>
              </Grid>
              <Grid item xs={6}>
                <Button
                  disabled={addTableMutation.isPending}
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    addTableMutation.mutateAsync({
                      name: `Table ${store?.tables?.length || 1}`,
                      storeId: storeId || '',
                      person: 1
                    })
                  }
                >
                  Add table
                </Button>
              </Grid>
              {store.tables && store.tables.length > 0 ? (
                store.tables.map((table) => {
                  return (
                    <Grid key={table._id} item xs={12}>
                      <Stack spacing={1}>
                        <Typography component={Link} to={`/auth/table/${table._id}`}>
                          Table: {table._id}
                        </Typography>
                        <Typography>Number of person: {table.person}</Typography>
                        <Typography>Is available: {table.isAvailable ? 'Yes' : 'No'}</Typography>
                        <Button
                          disabled={deleteTableMutation.isPending}
                          variant="contained"
                          color="error"
                          onClick={() => deleteTableMutation.mutateAsync(table._id)}
                        >
                          Delete table
                        </Button>
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
              {postMsg && (
                <Grid item xs={12}>
                  <FormHelperText error={postMsg instanceof Error}>{postMsg instanceof Error ? postMsg.message : postMsg}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  disableElevation
                  disabled={updateStoreMutation.isPending}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Update store
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  disableElevation
                  disabled={deleteStoreMutation.isPending}
                  fullWidth
                  size="large"
                  type="button"
                  variant="contained"
                  color="error"
                  onClick={() => deleteStoreMutation.mutateAsync(store._id)}
                >
                  Delete store
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      ) : (
        <Typography color={'error'} align="center" variant="h5">
          Store not found
        </Typography>
      )}
    </Container>
  );
}
