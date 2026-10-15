import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastContainer } from '@/ui/Toast';
import { UpdateToast } from '@/ui/UpdateToast';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
      <UpdateToast />
    </>
  );
}
