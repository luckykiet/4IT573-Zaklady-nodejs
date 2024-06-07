import { RouteObject } from 'react-router';

import AuthGuard from '@/utils/route-guard/AuthGuard';
import MainLayout from '@/layouts/MainLayout';
import Loadable from '@/components/Loadable';
import { lazy } from 'react';
import MerchantLayout from '@/layouts/MerchantLayout';

const MaintenanceError = Loadable(lazy(() => import('@/pages/maintenance/ErrorPage')));
const HomePage = Loadable(lazy(() => import('@/pages/app/auth/HomePage')));
const ReservationsPage = Loadable(lazy(() => import('@/pages/app/auth/ReservationsPage')));
const ReservationPage = Loadable(lazy(() => import('@/pages/app/auth/ReservationPage')));
const StoresPage = Loadable(lazy(() => import('@/pages/app/auth/StoresPage')));
const AddStorePage = Loadable(lazy(() => import('@/pages/app/auth/AddStorePage')));
const StorePage = Loadable(lazy(() => import('@/pages/app/auth/StorePage')));
const TablePage = Loadable(lazy(() => import('@/pages/app/auth/TablePage')));

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
      path: 'reservation/:reservationId',
      element: (
        <MerchantLayout>
          <ReservationPage />
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
      path: 'store',
      element: (
        <MerchantLayout>
          <AddStorePage />
        </MerchantLayout>
      )
    },
    {
      path: 'store/:storeId',
      element: (
        <MerchantLayout>
          <StorePage />
        </MerchantLayout>
      )
    },
    {
      path: 'table/:tableId',
      element: (
        <MerchantLayout>
          <TablePage />
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
