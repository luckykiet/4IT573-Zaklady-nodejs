import {
  Button,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  IconButton,
  Select,
  MenuItem
} from '@mui/material';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { RegistrationForm, RegistrationFormMutation } from '@/types/forms/auth';
import { SyntheticEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/auth';
import useAuthApi from '@/api/useAuthApi';
import { useAuthStoreActions } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ROLES } from '@/config';

// ============================|| LOGIN ||============================ //

const AuthRegistration = () => {
  const queryClient = useQueryClient();

  const { login: loginStore } = useAuthStoreActions();
  const { registration } = useAuthApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');
  const navigate = useNavigate();
  const registrationSchema = z.object({
    email: z.string({ required_error: 'Required' }).email('Invalid email').max(255),
    name: z.string({ required_error: 'Required' }).min(3).max(255),
    password: z.string({ required_error: 'Required' }).min(3).max(255),
    confirmPassword: z.string({ required_error: 'Required' }).min(3).max(255),
    role: z.enum(ROLES)
  });

  const mainUseForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: import.meta.env.MODE === 'development' ? 'User' : '',
      email: import.meta.env.MODE === 'development' ? 'ngntuankiet2@example.com' : '',
      password: import.meta.env.MODE === 'development' ? 'password123' : '',
      confirmPassword: import.meta.env.MODE === 'development' ? 'password123' : '',
      role: import.meta.env.MODE === 'development' ? 'merchant' : 'guest'
    },
    mode: 'all'
  });

  const { control, handleSubmit } = mainUseForm;

  const registrationMutation = useMutation({
    mutationFn: (data: RegistrationFormMutation) => registration(data),
    onError: (error) => {
      console.log(error);
      setPostMsg(error);
    },
    onSuccess: (data: UserProfile) => {
      loginStore(data);
      queryClient.clear();
      navigate('/auth');
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const onSubmit: SubmitHandler<RegistrationForm> = async (data) => {
    try {
      registrationMutation.mutateAsync({ ...data });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <FormProvider {...mainUseForm}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
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
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <InputLabel htmlFor={field.name}>E-mail</InputLabel>
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
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <InputLabel htmlFor={field.name}>Password</InputLabel>
                  <OutlinedInput
                    {...field}
                    fullWidth
                    error={Boolean(fieldState.isTouched && fieldState.invalid)}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="**************"
                  />
                  {fieldState.isTouched && fieldState.invalid && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
                </Stack>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <InputLabel htmlFor={field.name}>Confirm Password</InputLabel>
                  <OutlinedInput
                    {...field}
                    autoComplete=""
                    fullWidth
                    error={Boolean(fieldState.isTouched && fieldState.invalid)}
                    type={'password'}
                    placeholder="**************"
                  />
                  {fieldState.isTouched && fieldState.invalid && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
                </Stack>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <InputLabel htmlFor={field.name}>Role</InputLabel>
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
                    {ROLES.filter((r) => r !== 'admin').map((role) => {
                      return (
                        <MenuItem key={role} value={role}>
                          {role}
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
              disabled={registrationMutation.isPending}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Registration
            </Button>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default AuthRegistration;
