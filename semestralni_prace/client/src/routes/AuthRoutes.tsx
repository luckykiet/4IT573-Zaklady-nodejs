import { RouteObject } from 'react-router';

import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';
import LoginGuard from '@/utils/route-guard/LoginGuard';

const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const RegistrationPage = Loadable(lazy(() => import('@/pages/auth/RegistrationPage')));
const LoginPage = Loadable(lazy(() => import('@/pages/auth/LoginPage')));

// ==============================|| MAIN ROUTES ||============================== //

const AuthRoutes: RouteObject = {
  path: '/',
  errorElement: <MaintenanceError />,
  element: (
    <LoginGuard>
      <MainLayout />
    </LoginGuard>
  ),
  children: [
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/registration',
      element: <RegistrationPage />
    },
    {
      path: 'maintenance',
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError />
        }
      ]
    }
  ]
};

export default AuthRoutes;
