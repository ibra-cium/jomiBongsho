import type {
  LineLayerSpecification,
  FillLayerSpecification,
  RasterLayerSpecification,
} from 'maplibre-gl';

export const MOUZA_SHEET_SOURCE_ID = 'mouza-sheet';
export const MOUZA_SHEET_LAYER_ID = 'mouza-sheet-raster';

export function getMouzaSheetLayer(opacity = 0.85): RasterLayerSpecification {
  return {
    id: MOUZA_SHEET_LAYER_ID,
    type: 'raster',
    source: MOUZA_SHEET_SOURCE_ID,
    paint: {
      'raster-opacity': opacity,
      'raster-opacity-transition': { duration: 0 },
    },
  };
}

export const ROAD_SOURCE_ID = 'mouza-road';
export const ROAD_LAYER_ID = 'mouza-road-line';

export const DAGS_SOURCE_ID = 'dags';
export const DAGS_FILL_LAYER_ID = 'dags-fill';
export const DAGS_LINE_LAYER_ID = 'dags-line';
export const DAGS_SELECTED_LAYER_ID = 'dags-selected';

export const roadLayer: LineLayerSpecification = {
  id: ROAD_LAYER_ID,
  type: 'line',
  source: ROAD_SOURCE_ID,
  paint: {
    'line-color': '#5C5549',
    'line-width': 2,
    'line-dasharray': [4, 2],
    'line-opacity': 0.8,
  },
};

export function getDagsFillPaint(showRiskColors: boolean): FillLayerSpecification['paint'] {
  return {
    'fill-color': showRiskColors
      ? [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          'rgba(180, 83, 9, 0.40)',
          [
            'match',
            ['feature-state', 'verdict'],
            'green',
            'rgba(46, 125, 50, 0.28)',
            'yellow',
            'rgba(230, 81, 0, 0.32)',
            'red',
            'rgba(198, 40, 40, 0.35)',
            'rgba(0, 0, 0, 0.01)',
          ],
        ]
      : [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          'rgba(180, 83, 9, 0.25)',
          ['boolean', ['feature-state', 'hover'], false],
          'rgba(180, 83, 9, 0.12)',
          'rgba(0, 0, 0, 0.01)',
        ],
    'fill-opacity': 1,
  };
}

export const dagsFillLayer: FillLayerSpecification = {
  id: DAGS_FILL_LAYER_ID,
  type: 'fill',
  source: DAGS_SOURCE_ID,
  paint: getDagsFillPaint(false),
};

export const dagsLineLayer: LineLayerSpecification = {
  id: DAGS_LINE_LAYER_ID,
  type: 'line',
  source: DAGS_SOURCE_ID,
  paint: {
    'line-color': '#5C5549',
    'line-width': 1.5,
    'line-opacity': 0.85,
  },
};

export const dagsSelectedLayer: LineLayerSpecification = {
  id: DAGS_SELECTED_LAYER_ID,
  type: 'line',
  source: DAGS_SOURCE_ID,
  filter: ['boolean', ['feature-state', 'selected'], false],
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#9E472A',
    'line-width': 3.5,
  },
};
