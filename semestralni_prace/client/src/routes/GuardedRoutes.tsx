import { RouteObject } from 'react-router';

import AuthGuard from '@/utils/route-guard/AuthGuard';
import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';

const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const HomePage = Loadable(lazy(() => import('@/pages/app/HomePage')));

// ==============================|| MAIN ROUTES ||============================== //

const GuardedRoutes: RouteObject = {
  path: '/auth',
  errorElement: <MaintenanceError />,
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <HomePage />
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

export default GuardedRoutes;
