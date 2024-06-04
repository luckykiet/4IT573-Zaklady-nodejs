import { RouteObject } from 'react-router';

import AuthGuard from '@/utils/route-guard/AuthGuard';
import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';
import MerchantLayout from '@/layouts/MerchantLayout';

const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const HomePage = Loadable(lazy(() => import('@/pages/app/auth/HomePage')));
const ReservationsPage = Loadable(lazy(() => import('@/pages/app/auth/ReservationsPage')));
const StoresPage = Loadable(lazy(() => import('@/pages/app/auth/StoresPage')));

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
      path: 'reservations',
      element: (
        <MerchantLayout>
          <ReservationsPage />
        </MerchantLayout>
      )
    },
    {
      path: 'stores',
      element: (
        <MerchantLayout>
          <StoresPage />
        </MerchantLayout>
      )
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
