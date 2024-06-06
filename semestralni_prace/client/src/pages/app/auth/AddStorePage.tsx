import useStoreApi from '@/api/useStoresApi';
import { STORES_TYPES } from '@/config';
import { Store } from '@/types/api/store';
import { NewStoreForm, NewStoreFormMutation } from '@/types/forms/store';
import { zodResolver } from '@hookform/resolvers/zod';

import { Container, FormHelperText, Grid, Stack, Typography, InputLabel, OutlinedInput, Select, MenuItem, Button } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const storeSchema = z.object({
  name: z.string({ required_error: 'Required' }).min(3).max(255),
  address: z.object({
    street: z.string({ required_error: 'Required' }).min(3).max(255),
    city: z.string({ required_error: 'Required' }).min(2).max(255),
    zip: z.string({ required_error: 'Required' }).min(3).max(255),
    country: z.string({ required_error: 'Required' }).min(3).max(255)
  }),
  type: z.enum(STORES_TYPES)
});

export default function AddStorePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNewStore } = useStoreApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');

  const mainUseForm = useForm<NewStoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: import.meta.env.MODE === 'development' ? 'Gastro' : '',
      address: {
        street: import.meta.env.MODE === 'development' ? 'Street 123' : '',
        city: import.meta.env.MODE === 'development' ? 'Praha' : '',
        zip: import.meta.env.MODE === 'development' ? '11000' : '',
        country: 'Czech republic'
      },
      type: 'bistro'
    },
    mode: 'all'
  });

  const { control, handleSubmit } = mainUseForm;

  const addStoreMutation = useMutation({
    mutationFn: (data: NewStoreForm) => addNewStore(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: (data: Store) => {
      queryClient.clear();
      navigate(`/auth/store/${data._id}`);
    }
  });

  const onSubmit: SubmitHandler<NewStoreFormMutation> = async (data) => {
    try {
      addStoreMutation.mutateAsync({ ...data });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth={'xl'}>
      <FormProvider {...mainUseForm}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5">Add new store</Typography>
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
                    <OutlinedInput {...field} placeholder="abcdef" fullWidth error={Boolean(fieldState.isTouched && fieldState.invalid)} />
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
                    <OutlinedInput {...field} placeholder="abcdef" fullWidth error={Boolean(fieldState.isTouched && fieldState.invalid)} />
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
                    <OutlinedInput {...field} placeholder="abcdef" fullWidth error={Boolean(fieldState.isTouched && fieldState.invalid)} />
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
                    <OutlinedInput {...field} placeholder="abcdef" fullWidth error={Boolean(fieldState.isTouched && fieldState.invalid)} />
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

            {postMsg && (
              <Grid item xs={12}>
                <FormHelperText error={postMsg instanceof Error}>{postMsg instanceof Error ? postMsg.message : postMsg}</FormHelperText>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                disableElevation
                disabled={addStoreMutation.isPending}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="primary"
              >
                Add new store
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Container>
  );
}
