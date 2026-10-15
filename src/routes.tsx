import { createBrowserRouter } from 'react-router-dom';
import { MapScreen } from '@/app/MapScreen';
import { ReportScreen } from '@/app/ReportScreen';
import { VerifyScreen } from '@/app/VerifyScreen';
import { AboutScreen } from '@/app/AboutScreen';
import { PresentScreen } from '@/app/PresentScreen';
import { DevUiScreen } from '@/app/DevUiScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapScreen />,
  },
  {
    path: '/dag/:dagId',
    element: <MapScreen />,
  },
  {
    path: '/report/:dagId',
    element: <ReportScreen />,
  },
  {
    path: '/verify',
    element: <VerifyScreen />,
  },
  {
    path: '/about',
    element: <AboutScreen />,
  },
  {
    path: '/present',
    element: <PresentScreen />,
  },
  {
    path: '/dev/ui',
    element: <DevUiScreen />,
  },
]);
