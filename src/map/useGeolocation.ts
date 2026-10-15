import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, type GpsState } from '@/state/useAppStore';
import { useDataStore } from '@/data/useDataStore';
import { findDagAtPoint } from '@/lib/geo';
import centroid from '@turf/centroid';

export function useGeolocation() {
  const { demo, gpsLocation, setGpsLocation } = useAppStore();
  const dags = useDataStore((state) => state.data?.dags.features);
  const watchIdRef = useRef<number | null>(null);

  // Stop active watching
  const stopLocating = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Start real geolocation
  const startLocating = useCallback(() => {
    if (demo.simulatedLocation) {
      // In simulation mode, simulation handles location updates
      return;
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsLocation({ state: 'unsupported' });
      return;
    }

    setGpsLocation({ state: 'locating' });

    stopLocating();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const accuracy = pos.coords.accuracy;

        if (!dags || dags.length === 0) {
          setGpsLocation({ state: 'outside', coords, accuracy, dagId: null });
          return;
        }

        const match = findDagAtPoint(coords, dags);
        if (match) {
          setGpsLocation({
            state: 'found',
            coords,
            accuracy,
            dagId: match.properties.id,
          });
        } else {
          setGpsLocation({
            state: 'outside',
            coords,
            accuracy,
            dagId: null,
          });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsLocation({ state: 'denied', coords: null, accuracy: null, dagId: null });
        } else {
          setGpsLocation({ state: 'outside', coords: null, accuracy: null, dagId: null });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [demo.simulatedLocation, dags, stopLocating, setGpsLocation]);

  // Handle simulated location changes
  useEffect(() => {
    if (demo.simulatedLocation) {
      stopLocating();

      if (!dags || dags.length === 0) return;

      let targetCoords = demo.simulatedCoords;

      // If simulatedDagId is set, find its centroid
      if (!targetCoords && demo.simulatedDagId) {
        const feature = dags.find((f) => f.properties.id === demo.simulatedDagId);
        if (feature) {
          const c = centroid(feature);
          targetCoords = c.geometry.coordinates as [number, number];
        }
      }

      if (targetCoords) {
        const match = findDagAtPoint(targetCoords, dags);
        const dagId = match?.properties.id ?? demo.simulatedDagId ?? null;
        setGpsLocation({
          state: match ? 'found' : 'outside',
          coords: targetCoords,
          accuracy: 5,
          dagId,
        });
      }
    }
  }, [
    demo.simulatedLocation,
    demo.simulatedDagId,
    demo.simulatedCoords,
    dags,
    stopLocating,
    setGpsLocation,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLocating();
    };
  }, [stopLocating]);

  return {
    state: gpsLocation.state as GpsState,
    coords: gpsLocation.coords,
    accuracy: gpsLocation.accuracy,
    dagId: gpsLocation.dagId,
    startLocating,
    stopLocating,
  };
}
