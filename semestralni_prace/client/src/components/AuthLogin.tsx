import { Button, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, Stack, IconButton } from '@mui/material';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { LoginForm, LoginFormMutation } from '@/types/forms/auth';
import { SyntheticEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/auth';
import useAuthApi from '@/api/useAuthApi';
import { useAuthStoreActions } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// ============================|| LOGIN ||============================ //

const AuthLogin = () => {
  const queryClient = useQueryClient();

  const { login: loginStore } = useAuthStoreActions();
  const { login } = useAuthApi();
  const [postMsg, setPostMsg] = useState<string | Error>('');
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string({ required_error: 'Required' }).email('Invalid email').max(255),
    password: z.string({ required_error: 'Required' }).max(255)
  });

  const mainUseForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.MODE === 'development' ? 'ngntuankiet2@example.com' : '',
      password: import.meta.env.MODE === 'development' ? 'password123' : ''
    },
    mode: 'all'
  });

  const { control, handleSubmit } = mainUseForm;

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormMutation) => login(data),
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

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    try {
      loginMutation.mutateAsync({ ...data });
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
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <InputLabel htmlFor={field.name}>E-mail</InputLabel>
                  <OutlinedInput {...field} placeholder="abcdef" fullWidth error={Boolean(fieldState.isTouched && fieldState.invalid)} />
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
          {postMsg && (
            <Grid item xs={12}>
              <FormHelperText error={postMsg instanceof Error}>{postMsg instanceof Error ? postMsg.message : postMsg}</FormHelperText>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              disableElevation
              disabled={loginMutation.isPending}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default AuthLogin;
