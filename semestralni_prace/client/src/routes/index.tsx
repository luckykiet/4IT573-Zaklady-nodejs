import { APP_DEFAULT_PATH } from '@/config';

import MainRoutes from './MainRoutes';
import GuardedRoutes from './GuardedRoutes';
import AuthRoutes from './AuthRoutes';
import { createBrowserRouter } from 'react-router-dom';

// ==============================|| ROUTES RENDER ||============================== //

export default function Router() {
  return createBrowserRouter([MainRoutes, AuthRoutes, GuardedRoutes], { basename: APP_DEFAULT_PATH });
}
