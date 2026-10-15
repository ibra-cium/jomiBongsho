import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import centroid from '@turf/centroid';
import type { FeatureCollection, GeoPolygon, DagProps } from '@/engine/types';
import { toBanglaDigits } from '@/lib/format';

interface DagLabelsProps {
  map: maplibregl.Map | null;
  dags: FeatureCollection<GeoPolygon, DagProps> | null;
  lang: 'bn' | 'en';
  sheetOpacity?: number;
}

export const DagLabels: React.FC<DagLabelsProps> = ({ map, dags, lang, sheetOpacity = 0 }) => {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map || !dags || !dags.features) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const newMarkers: maplibregl.Marker[] = [];

    for (const feature of dags.features) {
      try {
        const c = centroid(feature);
        const [lng, lat] = c.geometry.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number') continue;

        const dagId = String(feature.properties.id || feature.id);
        const text = lang === 'bn' ? toBanglaDigits(dagId) : dagId;

        const el = document.createElement('div');
        el.className =
          'dag-marker-label pointer-events-none select-none transition-opacity duration-200';
        el.textContent = text;
        el.style.fontSize = '11px';
        el.style.fontWeight = '700';
        el.style.lineHeight = '1.1';
        el.style.fontFamily = lang === 'bn' ? '"Noto Serif Bengali", serif' : 'Inter, sans-serif';
        el.style.color = '#3D3730';
        el.style.backgroundColor = 'rgba(247, 243, 235, 0.90)';
        el.style.border = '1px solid rgba(92, 85, 73, 0.35)';
        el.style.padding = '2px 4px';
        el.style.borderRadius = '3px';
        el.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.08)';

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map);

        newMarkers.push(marker);
      } catch (err) {
        console.warn('Failed to calculate centroid for dag label', err);
      }
    }

    markersRef.current = newMarkers;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, dags, lang]);

  // Update visibility on zoom or sheetOpacity change without rebuilding markers
  useEffect(() => {
    if (!map) return;

    const updateVisibility = () => {
      const zoom = map.getZoom();
      const visible = zoom >= 15.5 && sheetOpacity <= 0.6;
      for (const m of markersRef.current) {
        const el = m.getElement();
        el.style.display = visible ? 'block' : 'none';
      }
    };

    updateVisibility();
    map.on('zoom', updateVisibility);

    return () => {
      map.off('zoom', updateVisibility);
    };
  }, [map, sheetOpacity]);

  return null;
};
