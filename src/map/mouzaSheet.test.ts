import { describe, it, expect } from 'vitest';
import {
  lngToMercX,
  latToMercY,
  projectCoord,
  computeSheetDimensions,
  calculateScaleBarPixels,
  getMouzaSheetDataUrl,
} from './mouzaSheet';
import type { Mouza, DagProps } from '@/engine/types';
import type { FeatureCollection, Polygon as GeoPolygon } from 'geojson';

describe('mouzaSheet Web Mercator projection and calculations', () => {
  const dummyMouza: Mouza = {
    id: 'test-mouza',
    nameBn: 'নতুন চর',
    nameEn: 'Notun Char',
    jlNo: '০০০',
    upazilaBn: 'মানিকগঞ্জ সদর',
    upazilaEn: 'Manikganj Sadar',
    districtBn: 'মানিকগঞ্জ',
    districtEn: 'Manikganj',
    areaClass: 'union',
    sourceTaxClass: 'B',
    center: [90.05, 23.87],
    bbox: [90.048, 23.868, 90.052, 23.872],
    sheetCorners: [
      [90.048, 23.872], // TL
      [90.052, 23.872], // TR
      [90.052, 23.868], // BR
      [90.048, 23.868], // BL
    ],
  };

  it('projects corner coordinates correctly to canvas pixel bounds', () => {
    const targetWidth = 2048;
    const { width, height } = computeSheetDimensions(dummyMouza.sheetCorners, targetWidth);

    expect(width).toBe(2048);
    expect(height).toBeGreaterThan(1000);
    expect(height).toBeLessThan(3000);

    // TL corner -> (0, 0)
    const tl = projectCoord(dummyMouza.sheetCorners[0], dummyMouza.sheetCorners, width, height);
    expect(Math.round(tl[0])).toBe(0);
    expect(Math.round(tl[1])).toBe(0);

    // TR corner -> (width, 0)
    const tr = projectCoord(dummyMouza.sheetCorners[1], dummyMouza.sheetCorners, width, height);
    expect(Math.round(tr[0])).toBe(width);
    expect(Math.round(tr[1])).toBe(0);

    // BR corner -> (width, height)
    const br = projectCoord(dummyMouza.sheetCorners[2], dummyMouza.sheetCorners, width, height);
    expect(Math.round(br[0])).toBe(width);
    expect(Math.round(br[1])).toBe(height);

    // BL corner -> (0, height)
    const bl = projectCoord(dummyMouza.sheetCorners[3], dummyMouza.sheetCorners, width, height);
    expect(Math.round(bl[0])).toBe(0);
    expect(Math.round(bl[1])).toBe(height);
  });

  it('projects center coordinates to canvas interior', () => {
    const { width, height } = computeSheetDimensions(dummyMouza.sheetCorners, 2048);
    const center = projectCoord(dummyMouza.center, dummyMouza.sheetCorners, width, height);

    expect(center[0]).toBeGreaterThan(width * 0.4);
    expect(center[0]).toBeLessThan(width * 0.6);
    expect(center[1]).toBeGreaterThan(height * 0.4);
    expect(center[1]).toBeLessThan(height * 0.6);
  });

  it('correctly maps Web Mercator longitude and latitude monotonically', () => {
    expect(lngToMercX(90.05)).toBeGreaterThan(lngToMercX(90.048));
    // In Web Mercator, higher latitude corresponds to lower Y (closer to 0 / north pole)
    expect(latToMercY(23.872)).toBeLessThan(latToMercY(23.868));
  });

  it('computes 50 meter scale bar pixel width accurately', () => {
    const { width } = computeSheetDimensions(dummyMouza.sheetCorners, 2048);
    const pixels50m = calculateScaleBarPixels(
      50,
      dummyMouza.center[1],
      dummyMouza.sheetCorners,
      width,
    );

    // In this latitude, ~40m cell is ~240px, so 50m should be ~300px
    expect(pixels50m).toBeGreaterThan(200);
    expect(pixels50m).toBeLessThan(400);
  });

  it('handles caching and mock canvas in environment without browser DOM', async () => {
    const dummyDags: FeatureCollection<GeoPolygon, DagProps> = {
      type: 'FeatureCollection',
      features: [],
    };

    const dataUrl = await getMouzaSheetDataUrl(dummyMouza, dummyDags);
    expect(typeof dataUrl).toBe('string');
    expect(dataUrl.startsWith('data:image/')).toBe(true);

    // Calling again returns the cached data URL
    const cached = await getMouzaSheetDataUrl(dummyMouza, dummyDags);
    expect(cached).toBe(dataUrl);
  });
});
