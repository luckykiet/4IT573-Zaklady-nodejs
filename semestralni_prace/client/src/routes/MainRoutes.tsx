import { RouteObject } from 'react-router';

import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';
import GuestGuard from '@/utils/route-guard/GuestGuard';
const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const HomePage = Loadable(lazy(() => import('@/pages/app/HomePage')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes: RouteObject = {
  path: '/',
  errorElement: <MaintenanceError />,
  element: (
    <GuestGuard>
      <MainLayout />
    </GuestGuard>
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

export default MainRoutes;
