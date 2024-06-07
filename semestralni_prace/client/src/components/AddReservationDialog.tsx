import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import _ from 'lodash';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Table } from '@/types/api/table';

import { NewReservationFormMutation } from '@/types/forms/reservation';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { RESERVATION_TIME_FORMAT } from '@/config';
import { DateTimePicker } from '@mui/x-date-pickers';
import useReservationsApi from '@/api/useReservationsApi';
import { useAuthStore } from '@/store/auth-store';

// ==============================|| STAFF - ADD / EDIT ||============================== //

export interface Props {
  table: Table;
  onCancel: () => void;
}

const AddReservation = ({ table, onCancel }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addReservation } = useReservationsApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');

  const addReservationSchema = z.object({
    email: z.string({ required_error: 'Required' }).email('Invalid email').max(255),
    name: z.string().min(2).max(255),
    start: z.string({ required_error: 'Required' }),
    end: z.string({ required_error: 'Required' })
  });

  type FormValidationSchema = z.infer<typeof addReservationSchema>;
  const mainUseForm = useForm<FormValidationSchema>({
    resolver: zodResolver(addReservationSchema),
    defaultValues: {
      name: user ? user.name : '',
      email: user ? user.email : '',
      start: undefined,
      end: undefined
    },
    mode: 'all'
  });

  const {
    control,
    handleSubmit,

    formState: { errors }
  } = mainUseForm;

  const addMutation = useMutation({
    mutationFn: (data: NewReservationFormMutation) => addReservation(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: (data) => {
      navigate(`/reservation/${data._id}`);
    }
  });

  const onSubmit: SubmitHandler<FormValidationSchema> = async (data) => {
    try {
      addMutation.mutateAsync({
        ...data,
        tableId: table._id,
        start: dayjs(data.start).format(RESERVATION_TIME_FORMAT),
        end: dayjs(data.end).format(RESERVATION_TIME_FORMAT)
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (errors && !_.isEmpty(errors)) {
      console.log(errors);
      setPostMsg(new Error('msg_control_typed_field'));
    } else {
      setPostMsg('');
    }
  }, [errors]);

  return (
    <FormProvider {...mainUseForm}>
      <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Stack spacing={1}>
            <Typography>Add new reservation</Typography>
            <Typography>Table: {table.name}</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Stack spacing={1}>
                    <InputLabel htmlFor={field.name}>Email</InputLabel>
                    <OutlinedInput
                      {...field}
                      type="email"
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
                name={'start'}
                control={control}
                render={({ field, fieldState }) => (
                  <Stack spacing={1}>
                    <InputLabel htmlFor={field.name}>Start</InputLabel>
                    <DateTimePicker
                      {...field}
                      inputRef={field.ref}
                      onChange={(day) => {
                        field.onChange(day?.format(RESERVATION_TIME_FORMAT));
                      }}
                      value={
                        dayjs.isDayjs(field.value)
                          ? field.value
                          : dayjs(field.value, RESERVATION_TIME_FORMAT, true).isValid()
                          ? dayjs(field.value, RESERVATION_TIME_FORMAT)
                          : null
                      }
                      sx={{ width: '100%' }}
                      format="DD/MM/YYYY HH:mm"
                    />
                    {fieldState.isTouched && fieldState.invalid && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
                  </Stack>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name={'end'}
                control={control}
                render={({ field, fieldState }) => (
                  <Stack spacing={1}>
                    <InputLabel htmlFor={field.name}>End</InputLabel>
                    <DateTimePicker
                      {...field}
                      inputRef={field.ref}
                      onChange={(day) => {
                        field.onChange(day?.format(RESERVATION_TIME_FORMAT));
                      }}
                      value={
                        dayjs.isDayjs(field.value)
                          ? field.value
                          : dayjs(field.value, RESERVATION_TIME_FORMAT, true).isValid()
                          ? dayjs(field.value, RESERVATION_TIME_FORMAT)
                          : null
                      }
                      sx={{ width: '100%' }}
                      format="DD/MM/YYYY HH:mm"
                    />
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
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button color="error" onClick={onCancel}>
                  Cancel
                </Button>
                <LoadingButton type="submit" variant="contained" disabled={addMutation.isPending}>
                  Add reservation
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </DialogActions>
      </form>
    </FormProvider>
  );
};

export default AddReservation;
