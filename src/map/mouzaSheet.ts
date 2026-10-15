import centroid from '@turf/centroid';
import { createRng } from '@/lib/rng';
import { toBanglaDigits } from '@/lib/format';
import type { Mouza, DagProps } from '@/engine/types';
import type { FeatureCollection, Polygon as GeoPolygon } from 'geojson';

/**
 * Web Mercator projection helpers
 * Ensures canvas pixel rendering is mathematically 100% aligned with MapLibre GL
 */
export function lngToMercX(lng: number): number {
  return (lng + 180) / 360;
}

export function latToMercY(lat: number): number {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  // Clamp sinLat to avoid Math.log(0) or Infinity near poles
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  return 0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI);
}

export interface SheetDimensions {
  width: number;
  height: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  deltaX: number;
  deltaY: number;
}

export function computeSheetDimensions(
  sheetCorners: [[number, number], [number, number], [number, number], [number, number]],
  targetWidth = 2048,
): SheetDimensions {
  const x0 = lngToMercX(sheetCorners[0][0]);
  const x1 = lngToMercX(sheetCorners[1][0]);
  const y0 = latToMercY(sheetCorners[0][1]);
  const y1 = latToMercY(sheetCorners[2][1]);

  const deltaX = Math.abs(x1 - x0);
  const deltaY = Math.abs(y1 - y0);
  const width = targetWidth;
  const height = Math.max(100, Math.round(width * (deltaY / deltaX)));

  return { width, height, x0, x1, y0, y1, deltaX, deltaY };
}

export function projectCoord(
  coord: [number, number],
  sheetCorners: [[number, number], [number, number], [number, number], [number, number]],
  width: number,
  height: number,
): [number, number] {
  const x0 = lngToMercX(sheetCorners[0][0]);
  const x1 = lngToMercX(sheetCorners[1][0]);
  const y0 = latToMercY(sheetCorners[0][1]);
  const y1 = latToMercY(sheetCorners[2][1]);

  const u = (lngToMercX(coord[0]) - x0) / (x1 - x0);
  const v = (latToMercY(coord[1]) - y0) / (y1 - y0);

  return [u * width, v * height];
}

export function calculateScaleBarPixels(
  meters: number,
  centerLat: number,
  sheetCorners: [[number, number], [number, number], [number, number], [number, number]],
  width: number,
): number {
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const metersPerDegLng = 111320 * cosLat;
  const deltaLng = meters / metersPerDegLng;

  const x0 = lngToMercX(sheetCorners[0][0]);
  const x1 = lngToMercX(sheetCorners[1][0]);
  const deltaX = x1 - x0;

  const u = (lngToMercX(sheetCorners[0][0] + deltaLng) - x0) / deltaX;
  return Math.abs(u * width);
}

// Module-level in-memory cache to guarantee single-pass drawing
let cachedDataUrl: string | null = null;
let cachedKey: string | null = null;

/**
 * Renders the authentic old mouza sheet onto an offscreen canvas and returns a PNG data URL.
 * Drawing is executed once and cached in memory.
 */
export async function getMouzaSheetDataUrl(
  mouza: Mouza,
  dags: FeatureCollection<GeoPolygon, DagProps>,
  forceRedraw = false,
): Promise<string> {
  const currentKey = `${mouza.id}:${dags.features.length}:${mouza.sheetCorners.join(',')}`;
  if (!forceRedraw && cachedKey === currentKey && cachedDataUrl) {
    return cachedDataUrl;
  }

  // Handle environments without browser DOM (e.g. Node tests)
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1560"><rect width="100%" height="100%" fill="#f4efe6"/><text x="100" y="100" font-family="serif" font-size="24" fill="#6b4e2e">মৌজা: ${mouza.nameBn}</text></svg>`;
    const fallbackUrl = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
    cachedDataUrl = fallbackUrl;
    cachedKey = currentKey;
    return fallbackUrl;
  }

  // Wait for Noto Serif Bengali and general document fonts
  try {
    if (document.fonts) {
      await Promise.race([
        Promise.all([
          document.fonts.load('600 28px "Noto Serif Bengali"'),
          document.fonts.load('500 16px "Hind Siliguri"'),
          document.fonts.ready,
        ]),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    }
  } catch (err) {
    console.warn('Font loading check timed out or failed; drawing with fallback font.', err);
  }

  const { width, height } = computeSheetDimensions(mouza.sheetCorners, 2048);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for mouza sheet rendering');
  }

  const rng = createRng('mouza-sheet-visual-signature-2026');

  // 1. Warm paper base
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(0, 0, width, height);

  // 1b. Tactile paper micro-noise
  const noiseCount = 35000;
  ctx.fillStyle = 'rgba(107, 78, 46, 0.04)';
  for (let i = 0; i < noiseCount; i++) {
    const nx = rng.next() * width;
    const ny = rng.next() * height;
    const nr = 0.5 + rng.next() * 1.0;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1c. Soft radial vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.28,
    width / 2,
    height / 2,
    width * 0.72,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, 'rgba(107, 78, 46, 0.05)');
  vignette.addColorStop(1, 'rgba(84, 55, 30, 0.16)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 1d. Two faint fold lines (creases)
  // Vertical crease
  ctx.save();
  const midX = width * 0.505;
  ctx.strokeStyle = 'rgba(75, 50, 25, 0.13)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let y = 0; y <= height; y += 30) {
    const jx = midX + (rng.next() - 0.5) * 1.4;
    if (y === 0) ctx.moveTo(jx, y);
    else ctx.lineTo(jx, y);
  }
  ctx.stroke();

  // Vertical highlight edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let y = 0; y <= height; y += 30) {
    const jx = midX + 1.5 + (rng.next() - 0.5) * 1.4;
    if (y === 0) ctx.moveTo(jx, y);
    else ctx.lineTo(jx, y);
  }
  ctx.stroke();

  // Horizontal crease
  const midY = height * 0.495;
  ctx.strokeStyle = 'rgba(75, 50, 25, 0.13)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 30) {
    const jy = midY + (rng.next() - 0.5) * 1.4;
    if (x === 0) ctx.moveTo(x, jy);
    else ctx.lineTo(x, jy);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 30) {
    const jy = midY + 1.5 + (rng.next() - 0.5) * 1.4;
    if (x === 0) ctx.moveTo(x, jy);
    else ctx.lineTo(x, jy);
  }
  ctx.stroke();
  ctx.restore();

  // 2. Faint diagonal watermark across paper
  ctx.save();
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.font = '500 26px "Hind Siliguri", sans-serif';
  ctx.fillStyle = 'rgba(107, 78, 46, 0.085)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wmText = 'ডেমো ডেটা – বাস্তব রেকর্ড নয়';

  for (let wy = -height * 1.5; wy < height * 2; wy += 140) {
    for (let wx = -width * 1.5; wx < width * 2; wx += 360) {
      ctx.fillText(wmText, wx, wy);
    }
  }
  ctx.restore();

  // 3. Road line (if present)
  if (mouza.roadLine && mouza.roadLine.coordinates.length >= 2) {
    ctx.save();
    const roadCoords = mouza.roadLine.coordinates.map((c) =>
      projectCoord(c as [number, number], mouza.sheetCorners, width, height),
    );

    ctx.strokeStyle = 'rgba(92, 70, 48, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    roadCoords.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();

    // Small road label
    if (roadCoords[0] && roadCoords[1]) {
      const midPx = (roadCoords[0][0] + roadCoords[1][0]) / 2;
      const midPy = (roadCoords[0][1] + roadCoords[1][1]) / 2 + 18;
      ctx.font = '500 16px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#6E523A';
      ctx.textAlign = 'center';
      ctx.fillText('রাস্তা', midPx, midPy);
    }
    ctx.restore();
  }

  // 4. Dag Boundaries (Hand-drawn feel in sepia ink)
  // Deduplicate shared edges so adjacent parcels share the identical line stroke
  const edgeMap = new Map<string, [[number, number], [number, number]]>();

  for (const feature of dags.features) {
    const ring = feature.geometry.coordinates[0];
    if (!ring) continue;

    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i]!;
      const p2 = ring[i + 1]!;
      const k1 = `${p1[0]?.toFixed(7)},${p1[1]?.toFixed(7)}`;
      const k2 = `${p2[0]?.toFixed(7)},${p2[1]?.toFixed(7)}`;
      const edgeKey = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;

      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, [p1 as [number, number], p2 as [number, number]]);
      }
    }
  }

  ctx.save();
  ctx.strokeStyle = '#523B26'; // Deep archival sepia ink
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [, [g1, g2]] of edgeMap) {
    const pt1 = projectCoord(g1, mouza.sheetCorners, width, height);
    const pt2 = projectCoord(g2, mouza.sheetCorners, width, height);

    const dx = pt2[0] - pt1[0];
    const dy = pt2[1] - pt1[1];
    const segLen = Math.hypot(dx, dy);

    // Number of jittered sub-segments
    const steps = Math.max(2, Math.round(segLen / 24));
    const normalX = -dy / (segLen || 1);
    const normalY = dx / (segLen || 1);

    ctx.beginPath();
    ctx.lineWidth = 1.8 + (rng.next() - 0.5) * 0.6; // 1.5 - 2.1 px
    ctx.moveTo(pt1[0], pt1[1]);

    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const baseX = pt1[0] + dx * t;
      const baseY = pt1[1] + dy * t;
      const jitterAmount = (rng.next() - 0.5) * 1.2; // +/- 0.6px
      const jx = baseX + normalX * jitterAmount;
      const jy = baseY + normalY * jitterAmount;
      ctx.lineTo(jx, jy);
    }

    ctx.lineTo(pt2[0], pt2[1]);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Dag Numbers in Bangla digits (Noto Serif Bengali)
  ctx.save();
  ctx.font = '600 28px "Noto Serif Bengali", serif';
  ctx.fillStyle = '#422E1D'; // Walnut dip-pen ink
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const feature of dags.features) {
    const dagId = String(feature.properties.id || feature.id);
    const bnNum = toBanglaDigits(dagId);

    try {
      const c = centroid(feature);
      const [cLng, cLat] = c.geometry.coordinates as [number, number];
      const [cPx, cPy] = projectCoord([cLng, cLat], mouza.sheetCorners, width, height);

      // Micro-rotation for natural hand-lettered feel (+/- 1.2 deg)
      const angle = (rng.next() - 0.5) * 0.04;
      ctx.save();
      ctx.translate(cPx, cPy);
      ctx.rotate(angle);
      ctx.fillText(bnNum, 0, 0);
      ctx.restore();
    } catch (e) {
      console.warn(`Failed to place dag label for ${dagId}`, e);
    }
  }
  ctx.restore();

  // 6. Cartouche Box (top-left margin)
  ctx.save();
  const cX = 60;
  const cY = 50;
  const cW = 440;
  const cH = 155;

  // Background parchment fill
  ctx.fillStyle = '#F8F4EC';
  ctx.fillRect(cX, cY, cW, cH);

  // Double border
  ctx.strokeStyle = '#543D28';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cX, cY, cW, cH);

  ctx.lineWidth = 1.0;
  ctx.strokeRect(cX + 4, cY + 4, cW - 8, cH - 8);

  // Cartouche text
  ctx.fillStyle = '#3E2B1C';
  ctx.font = '600 22px "Noto Serif Bengali", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`মৌজা: ${mouza.nameBn} · জে.এল. নং ${toBanglaDigits(mouza.jlNo)}`, cX + 18, cY + 16);

  ctx.font = '500 15px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#5A4330';
  ctx.fillText(`উপজেলা: ${mouza.upazilaBn} · জেলা: ${mouza.districtBn}`, cX + 18, cY + 50);

  ctx.font = '500 13px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#785D45';
  ctx.fillText('ক্যাডেল্ট্রাল জরিপ ডেমো নকশা · প্রদর্শনী সংস্করণ', cX + 18, cY + 76);

  // Scale bar (50m) inside/under cartouche
  const scale50mPx = calculateScaleBarPixels(50, mouza.center[1], mouza.sheetCorners, width);
  const barY = cY + 120;
  const barX = cX + 18;
  const barH = 7;

  // Outer outline
  ctx.strokeStyle = '#543D28';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, scale50mPx, barH);

  // First 25m segment filled
  ctx.fillStyle = '#543D28';
  ctx.fillRect(barX, barY, scale50mPx / 2, barH);

  // Scale tick labels
  ctx.font = '500 12px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#4A3423';
  ctx.textAlign = 'center';
  ctx.fillText('০', barX, barY - 6);
  ctx.fillText('২৫', barX + scale50mPx / 2, barY - 6);
  ctx.fillText('৫০ মি.', barX + scale50mPx, barY - 6);

  // North Arrow
  const arrowX = cX + cW - 46;
  const arrowY = cY + 68;
  const arrowLen = 38;

  ctx.strokeStyle = '#543D28';
  ctx.fillStyle = '#543D28';
  ctx.lineWidth = 2;

  // Arrow shaft pointing up (North)
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY + arrowLen / 2);
  ctx.lineTo(arrowX, arrowY - arrowLen / 2);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY - arrowLen / 2 - 8);
  ctx.lineTo(arrowX - 7, arrowY - arrowLen / 2 + 5);
  ctx.lineTo(arrowX, arrowY - arrowLen / 2);
  ctx.lineTo(arrowX + 7, arrowY - arrowLen / 2 + 5);
  ctx.closePath();
  ctx.fill();

  // 'উ' for North (Bengali: উত্তর)
  ctx.font = 'bold 15px "Noto Serif Bengali", serif';
  ctx.textAlign = 'center';
  ctx.fillText('উ', arrowX, arrowY - arrowLen / 2 - 12);

  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  cachedDataUrl = dataUrl;
  cachedKey = currentKey;

  return dataUrl;
}
