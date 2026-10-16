import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MapScreen } from '@/app/MapScreen';
import { ErrorBoundary, Skeleton } from '@/ui';

const ReportScreen = React.lazy(() =>
  import('@/app/ReportScreen').then((m) => ({ default: m.ReportScreen })),
);
const VerifyScreen = React.lazy(() =>
  import('@/app/VerifyScreen').then((m) => ({ default: m.VerifyScreen })),
);
const AboutScreen = React.lazy(() =>
  import('@/app/AboutScreen').then((m) => ({ default: m.AboutScreen })),
);
const PresentScreen = React.lazy(() =>
  import('@/app/PresentScreen').then((m) => ({ default: m.PresentScreen })),
);
const DevUiScreen = React.lazy(() =>
  import('@/app/DevUiScreen').then((m) => ({ default: m.DevUiScreen })),
);
const NotFoundScreen = React.lazy(() =>
  import('@/app/NotFoundScreen').then((m) => ({ default: m.NotFoundScreen })),
);

function Suspended({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
          <div className="p-6 bg-paper-2 border border-line rounded-2xl shadow-paper flex flex-col items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-44 h-4 rounded" />
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MapScreen />,
    errorElement: (
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    ),
    children: [
      {
        path: 'dag/:dagId',
        element: null,
      },
    ],
  },
  {
    path: '/report/:dagId',
    element: (
      <Suspended>
        <ReportScreen />
      </Suspended>
    ),
  },
  {
    path: '/verify',
    element: (
      <Suspended>
        <VerifyScreen />
      </Suspended>
    ),
  },
  {
    path: '/about',
    element: (
      <Suspended>
        <AboutScreen />
      </Suspended>
    ),
  },
  {
    path: '/present',
    element: (
      <Suspended>
        <PresentScreen />
      </Suspended>
    ),
  },
  {
    path: '/dev/ui',
    element: (
      <Suspended>
        <DevUiScreen />
      </Suspended>
    ),
  },
  {
    path: '*',
    element: (
      <Suspended>
        <NotFoundScreen />
      </Suspended>
    ),
  },
]);
