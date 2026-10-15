import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(maplibreWorkerUrl);
import centroid from '@turf/centroid';
import type { DemoData } from '@/engine/types';
import { analyseDag } from '@/engine';
import {
  MOUZA_SHEET_SOURCE_ID,
  MOUZA_SHEET_LAYER_ID,
  getMouzaSheetLayer,
  ROAD_SOURCE_ID,
  ROAD_LAYER_ID,
  DAGS_SOURCE_ID,
  DAGS_FILL_LAYER_ID,
  roadLayer,
  dagsFillLayer,
  dagsLineLayer,
  dagsSelectedLayer,
  getDagsFillPaint,
} from './layers';
import { getMouzaSheetDataUrl } from './mouzaSheet';
import { DagLabels } from './DagLabels';

interface MapViewProps {
  data: DemoData;
  selectedDagId: string | null;
  onSelectDag: (dagId: string | null) => void;
  lang: 'bn' | 'en';
  showRiskColors?: boolean;
  sheetOpacity?: number;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  data,
  selectedDagId,
  onSelectDag,
  lang,
  showRiskColors = false,
  sheetOpacity = 0.85,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const prevSelectedRef = useRef<string | null>(null);
  const onSelectDagRef = useRef(onSelectDag);
  const sheetOpacityRef = useRef(sheetOpacity);

  useEffect(() => {
    sheetOpacityRef.current = sheetOpacity;
  }, [sheetOpacity]);

  useEffect(() => {
    onSelectDagRef.current = onSelectDag;
  }, [onSelectDag]);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const { mouza, dags } = data;
    const [minLng, minLat, maxLng, maxLat] = mouza.bbox;

    // Expand bbox by ~2km for maxBounds
    const boundsPadLng = 0.02;
    const boundsPadLat = 0.018;
    const maxBounds: [number, number, number, number] = [
      minLng - boundsPadLng,
      minLat - boundsPadLat,
      maxLng + boundsPadLng,
      maxLat + boundsPadLat,
    ];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: mouza.center,
      zoom: 16.2,
      maxBounds,
      attributionControl: false, // Custom attribution control added below
    });

    // Add standard attribution control
    map.addControl(
      new maplibregl.AttributionControl({
        compact: false,
      }),
      'bottom-right',
    );

    mapRef.current = map;

    map.on('load', () => {
      // 1. Add Mouza Sheet Image Source & Raster Layer (under roads and dags)
      getMouzaSheetDataUrl(mouza, dags)
        .then((sheetUrl) => {
          if (!mapRef.current) return;
          if (!map.getSource(MOUZA_SHEET_SOURCE_ID)) {
            map.addSource(MOUZA_SHEET_SOURCE_ID, {
              type: 'image',
              url: sheetUrl,
              coordinates: mouza.sheetCorners,
            });

            // Position raster layer directly under road or dags
            const beforeId = map.getLayer(ROAD_LAYER_ID)
              ? ROAD_LAYER_ID
              : map.getLayer(DAGS_FILL_LAYER_ID)
                ? DAGS_FILL_LAYER_ID
                : undefined;

            map.addLayer(getMouzaSheetLayer(sheetOpacityRef.current), beforeId);
          }
        })
        .catch((err) => {
          console.warn('Failed to load mouza sheet overlay', err);
        });

      // 2. Add Mouza Road Source & Layer
      if (mouza.roadLine && !map.getSource(ROAD_SOURCE_ID)) {
        map.addSource(ROAD_SOURCE_ID, {
          type: 'geojson',
          data: mouza.roadLine,
        });
        map.addLayer(roadLayer);
      }

      // 2. Add Dags Source (with promoteId for fast feature-state)
      if (!map.getSource(DAGS_SOURCE_ID)) {
        map.addSource(DAGS_SOURCE_ID, {
          type: 'geojson',
          data: dags as GeoJSON.FeatureCollection,
          promoteId: 'id',
        });

        // Add fill, line, and selected layers
        map.addLayer(dagsFillLayer);
        map.addLayer(dagsLineLayer);
        map.addLayer(dagsSelectedLayer);

        // Pre-compute verdicts and populate feature-state for all dags
        for (const feature of dags.features) {
          const dagId = String(feature.properties.id || feature.id);
          try {
            const analysis = analyseDag(dagId, data);
            map.setFeatureState(
              { source: DAGS_SOURCE_ID, id: dagId },
              { verdict: analysis.verdict },
            );
          } catch (e) {
            console.warn(`Failed to analyse dag ${dagId}`, e);
          }
        }
      }

      // Fit map to mouza bounds
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: { top: 60, bottom: 120, left: 40, right: 40 },
          maxZoom: 18,
          duration: 0,
        },
      );

      // Handle hover interactions
      let hoveredId: string | null = null;
      map.on('mousemove', DAGS_FILL_LAYER_ID, (e: maplibregl.MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const feature = e.features[0];
          if (!feature) return;
          const id = String(feature.id ?? feature.properties?.id);
          if (hoveredId !== id) {
            if (hoveredId) {
              map.setFeatureState({ source: DAGS_SOURCE_ID, id: hoveredId }, { hover: false });
            }
            hoveredId = id;
            map.setFeatureState({ source: DAGS_SOURCE_ID, id }, { hover: true });
          }
        }
      });

      map.on('mouseleave', DAGS_FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId) {
          map.setFeatureState({ source: DAGS_SOURCE_ID, id: hoveredId }, { hover: false });
          hoveredId = null;
        }
      });

      // Handle polygon click selection
      map.on('click', DAGS_FILL_LAYER_ID, (e: maplibregl.MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (!feature) return;
          const id = String(feature.id ?? feature.properties?.id);
          onSelectDagRef.current(id);
          e.originalEvent.stopPropagation();
        }
      });

      // Handle empty map click deselection
      map.on('click', (e: maplibregl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [DAGS_FILL_LAYER_ID],
        });
        if (features.length === 0) {
          onSelectDagRef.current(null);
        }
      });

      setMapLoaded(true);
    });

    return () => {
      setMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
    // Map instance should only be initialized once per mouza dataset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.mouza.id]);

  // Update selection feature-state when selectedDagId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getSource(DAGS_SOURCE_ID)) return;

    const prevId = prevSelectedRef.current;
    if (prevId && prevId !== selectedDagId) {
      map.setFeatureState({ source: DAGS_SOURCE_ID, id: prevId }, { selected: false });
    }

    if (selectedDagId) {
      map.setFeatureState({ source: DAGS_SOURCE_ID, id: selectedDagId }, { selected: true });

      // Ease map to focus selected dag
      const feature = data.dags.features.find(
        (f) => String(f.properties.id || f.id) === selectedDagId,
      );
      if (feature) {
        try {
          const c = centroid(feature);
          const [lng, lat] = c.geometry.coordinates;
          if (typeof lng === 'number' && typeof lat === 'number') {
            const isWideScreen = window.innerWidth >= 1024;
            // On mobile, offset up so it stays above bottom sheet; on laptop, offset right
            const offset: [number, number] = isWideScreen ? [120, 0] : [0, -100];
            map.easeTo({
              center: [lng, lat],
              offset,
              duration: 500,
            });
          }
        } catch (err) {
          console.warn('Error focusing selected dag', err);
        }
      }
    }

    prevSelectedRef.current = selectedDagId;
  }, [selectedDagId, mapLoaded, data]);

  // Update paint when showRiskColors changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer(DAGS_FILL_LAYER_ID)) return;

    const newPaint = getDagsFillPaint(showRiskColors);
    if (newPaint && newPaint['fill-color']) {
      map.setPaintProperty(DAGS_FILL_LAYER_ID, 'fill-color', newPaint['fill-color']);
    }
  }, [showRiskColors, mapLoaded]);

  // Update raster-opacity when sheetOpacity changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer(MOUZA_SHEET_LAYER_ID)) return;
    map.setPaintProperty(MOUZA_SHEET_LAYER_ID, 'raster-opacity', sheetOpacity);
  }, [sheetOpacity, mapLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <DagLabels map={mapRef.current} dags={data.dags} lang={lang} sheetOpacity={sheetOpacity} />
    </div>
  );
};
