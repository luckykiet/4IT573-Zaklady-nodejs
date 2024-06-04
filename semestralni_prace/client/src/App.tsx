import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Router from '@/routes';
import { RouterProvider } from 'react-router-dom';

// ==============================|| APP - ROUTER ||============================== //
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      retryOnMount: false,
      retryDelay: 3000
    }
  }
});

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
      <QueryClientProvider client={queryClient}>
        {import.meta.env.MODE === 'development' && <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />}
        <RouterProvider router={Router()} />
      </QueryClientProvider>
    </LocalizationProvider>
  );
};

export default App;
