import { RouteObject } from 'react-router';

import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';
import GuestGuard from '@/utils/route-guard/GuestGuard';
const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const HomePage = Loadable(lazy(() => import('@/pages/app/HomePage')));
const StorePage = Loadable(lazy(() => import('@/pages/app/StorePage')));
const ReservationPage = Loadable(lazy(() => import('@/pages/app/ReservationPage')));

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
      path: 'store/:storeId',
      element: <StorePage />
    },
    {
      path: 'reservation/:reservationId',
      element: <ReservationPage />
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
