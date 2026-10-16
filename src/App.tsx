import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastContainer } from '@/ui/Toast';
import { UpdateToast } from '@/ui/UpdateToast';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
      <UpdateToast />
    </ErrorBoundary>
  );
}
