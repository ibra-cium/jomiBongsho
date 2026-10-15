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
 * Renders an authentic historical Bangladesh cadastral mouza sheet (CS/RS style)
 * onto an offscreen canvas and returns a PNG data URL.
 * Modelled on authentic 1930s-1980s Cadastral Survey records.
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
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1560"><rect width="100%" height="100%" fill="#ded0ba"/><text x="100" y="100" font-family="serif" font-size="24" fill="#282019">মৌজা: ${mouza.nameBn}</text></svg>`;
    const fallbackUrl = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
    cachedDataUrl = fallbackUrl;
    cachedKey = currentKey;
    return fallbackUrl;
  }

  // Wait for Noto Serif Bengali and Hind Siliguri fonts
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

  const rng = createRng('mouza-sheet-cadastral-reference-2026');

  // 1. Authentic aged tan/buff parchment background (matching real reference photo)
  ctx.fillStyle = '#D9CAAE';
  ctx.fillRect(0, 0, width, height);

  // 1b. Layered aged washes and natural paper stains
  const wash1 = ctx.createLinearGradient(0, 0, width, height);
  wash1.addColorStop(0, 'rgba(195, 175, 142, 0.45)');
  wash1.addColorStop(0.5, 'rgba(224, 212, 187, 0.25)');
  wash1.addColorStop(1, 'rgba(190, 168, 134, 0.50)');
  ctx.fillStyle = wash1;
  ctx.fillRect(0, 0, width, height);

  // Subtle tea-stain clouds across the paper
  for (let s = 0; s < 12; s++) {
    const sx = rng.next() * width;
    const sy = rng.next() * height;
    const sr = 120 + rng.next() * 320;
    const stainGrad = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr);
    stainGrad.addColorStop(0, 'rgba(145, 115, 78, 0.08)');
    stainGrad.addColorStop(0.6, 'rgba(145, 115, 78, 0.03)');
    stainGrad.addColorStop(1, 'rgba(145, 115, 78, 0)');
    ctx.fillStyle = stainGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Tactile paper micro-fibers and noise
  const noiseCount = 40000;
  ctx.fillStyle = 'rgba(80, 58, 32, 0.045)';
  for (let i = 0; i < noiseCount; i++) {
    const nx = rng.next() * width;
    const ny = rng.next() * height;
    const nr = 0.5 + rng.next() * 1.0;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer edge vignette / natural sheet darkening
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.32,
    width / 2,
    height / 2,
    width * 0.72,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, 'rgba(100, 75, 45, 0.07)');
  vignette.addColorStop(1, 'rgba(70, 48, 25, 0.22)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 1c. Document Fold Lines (Vertical & Horizontal Creases)
  ctx.save();
  const midX = width * 0.505;
  ctx.strokeStyle = 'rgba(65, 45, 25, 0.16)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let y = 0; y <= height; y += 25) {
    const jx = midX + (rng.next() - 0.5) * 1.5;
    if (y === 0) ctx.moveTo(jx, y);
    else ctx.lineTo(jx, y);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let y = 0; y <= height; y += 25) {
    const jx = midX + 1.8 + (rng.next() - 0.5) * 1.5;
    if (y === 0) ctx.moveTo(jx, y);
    else ctx.lineTo(jx, y);
  }
  ctx.stroke();

  const midY = height * 0.495;
  ctx.strokeStyle = 'rgba(65, 45, 25, 0.16)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 25) {
    const jy = midY + (rng.next() - 0.5) * 1.5;
    if (x === 0) ctx.moveTo(x, jy);
    else ctx.lineTo(x, jy);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 25) {
    const jy = midY + 1.8 + (rng.next() - 0.5) * 1.5;
    if (x === 0) ctx.moveTo(x, jy);
    else ctx.lineTo(x, jy);
  }
  ctx.stroke();
  ctx.restore();

  // 2. Faint diagonal demo watermark (never obscures, maintains compliance with AGENTS.md rule 2)
  ctx.save();
  ctx.rotate((-26 * Math.PI) / 180);
  ctx.font = '500 24px "Hind Siliguri", sans-serif';
  ctx.fillStyle = 'rgba(95, 68, 40, 0.075)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wmText = 'ডেমো ডেটা – বাস্তব রেকর্ড নয়';

  for (let wy = -height * 1.5; wy < height * 2; wy += 150) {
    for (let wx = -width * 1.5; wx < width * 2; wx += 380) {
      ctx.fillText(wmText, wx, wy);
    }
  }
  ctx.restore();

  // 3. Top Margin Mouza Annotations & Canal (like "ভাগাভিটার খাল" & "কাশিয়াইল নং ১৯১" in reference)
  ctx.save();
  ctx.fillStyle = '#261E17'; // Authentic carbon sepia ink

  // North Adjacent Mouza Calligraphy
  ctx.font = '600 20px "Noto Serif Bengali", serif';
  ctx.textAlign = 'center';
  ctx.fillText('কাশিয়াইল মৌজা নং ১৯১', width * 0.5, 36);

  // Canal annotation ("ভাগাভিটার খাল") with wavy canal indication
  ctx.font = '600 18px "Noto Serif Bengali", serif';
  ctx.fillText('ভাগাভিটার খাল', width * 0.55, 62);

  // Wavy canal banks along the top margin
  ctx.strokeStyle = 'rgba(40, 32, 24, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const canalY = 74;
  for (let x = width * 0.38; x <= width * 0.72; x += 15) {
    const cy = canalY + Math.sin(x * 0.03) * 3 + (rng.next() - 0.5) * 1.0;
    if (x === width * 0.38) ctx.moveTo(x, cy);
    else ctx.lineTo(x, cy);
  }
  ctx.stroke();

  // South Adjacent Mouza Calligraphy (matching reference "আন্দোলী নং ১৬২")
  ctx.fillText('আন্দোলী মৌজা নং ১৬২', width * 0.48, height - 32);

  // East Adjacent Mouza Calligraphy
  ctx.save();
  ctx.translate(width - 32, height * 0.52);
  ctx.rotate(Math.PI / 2);
  ctx.font = '500 16px "Noto Serif Bengali", serif';
  ctx.fillText('চর বোয়ালিয়া মৌজা নং ১৬৩', 0, 0);
  ctx.restore();

  ctx.restore();

  // 4. Mouza Road (Southern road line with authentic cadastral double dashed bank)
  if (mouza.roadLine && mouza.roadLine.coordinates.length >= 2) {
    ctx.save();
    const roadCoords = mouza.roadLine.coordinates.map((c) =>
      projectCoord(c as [number, number], mouza.sheetCorners, width, height),
    );

    ctx.strokeStyle = '#2B221A';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([14, 7]);
    ctx.beginPath();
    roadCoords.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();

    // Secondary parallel boundary line of road
    ctx.beginPath();
    roadCoords.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1] + 6);
      else ctx.lineTo(p[0], p[1] + 6);
    });
    ctx.stroke();

    if (roadCoords[0] && roadCoords[1]) {
      const midPx = (roadCoords[0][0] + roadCoords[1][0]) / 2;
      const midPy = (roadCoords[0][1] + roadCoords[1][1]) / 2 + 20;
      ctx.font = '500 15px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#2B221A';
      ctx.textAlign = 'center';
      ctx.fillText('রাস্তা', midPx, midPy);
    }
    ctx.restore();
  }

  // 5. Dag Boundaries (Hand-inked dip-pen lines)
  // Deduplicate shared edges so adjacent parcels share identical pen strokes
  const edgeMap = new Map<string, [[number, number], [number, number]]>();
  const perimeterPoints: [number, number][] = [];

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
  ctx.strokeStyle = '#261E17'; // Deep carbon sepia ink
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [, [g1, g2]] of edgeMap) {
    const pt1 = projectCoord(g1, mouza.sheetCorners, width, height);
    const pt2 = projectCoord(g2, mouza.sheetCorners, width, height);

    const dx = pt2[0] - pt1[0];
    const dy = pt2[1] - pt1[1];
    const segLen = Math.hypot(dx, dy);

    // Number of jittered sub-segments
    const steps = Math.max(2, Math.round(segLen / 22));
    const normalX = -dy / (segLen || 1);
    const normalY = dx / (segLen || 1);

    ctx.beginPath();
    ctx.lineWidth = 1.6 + (rng.next() - 0.5) * 0.5; // 1.35 - 1.85 px
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

  // 6. Pond / Doba Embankments (Dags 147 and 148, like the ponds in reference image)
  for (const feature of dags.features) {
    const landClass = feature.properties.landClass;
    if (landClass === 'doba') {
      const ring = feature.geometry.coordinates[0];
      if (ring && ring.length >= 4) {
        ctx.save();
        const pts = ring.map((pt) =>
          projectCoord(pt as [number, number], mouza.sheetCorners, width, height),
        );
        const c = centroid(feature);
        const [cLng, cLat] = c.geometry.coordinates as [number, number];
        const [cPx, cPy] = projectCoord([cLng, cLat], mouza.sheetCorners, width, height);

        // Draw inner concentric water rectangle
        ctx.strokeStyle = '#261E17';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        const innerScale = 0.55;
        const innerPts: [number, number][] = [];
        pts.forEach((p, idx) => {
          const ix = cPx + (p[0] - cPx) * innerScale;
          const iy = cPy + (p[1] - cPy) * innerScale;
          innerPts.push([ix, iy]);
          if (idx === 0) ctx.moveTo(ix, iy);
          else ctx.lineTo(ix, iy);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw pond embankment tick marks (hachures) between outer and inner banks
        ctx.lineWidth = 1.0;
        for (let i = 0; i < pts.length - 1; i++) {
          const op1 = pts[i]!;
          const op2 = pts[i + 1]!;
          const ip1 = innerPts[i]!;
          const ip2 = innerPts[i + 1]!;

          const numTicks = 6;
          for (let k = 1; k < numTicks; k++) {
            const t = k / numTicks;
            const ox = op1[0] + (op2[0] - op1[0]) * t;
            const oy = op1[1] + (op2[1] - op1[1]) * t;
            const ix = ip1[0] + (ip2[0] - ip1[0]) * t;
            const iy = ip1[1] + (ip2[1] - ip1[1]) * t;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ix, iy);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
  }

  // 7. Survey Station Pillars (⊙ along outer perimeter, matching reference map)
  // Pick perimeter corners for station marks
  const cornerDags = ['101', '108', '141', '148', '104', '144'];
  let stationNo = 1;
  for (const cDagId of cornerDags) {
    const feat = dags.features.find((f) => String(f.properties.id || f.id) === cDagId);
    if (feat) {
      const ring = feat.geometry.coordinates[0];
      if (ring && ring[0]) {
        const [px, py] = projectCoord(
          ring[0] as [number, number],
          mouza.sheetCorners,
          width,
          height,
        );
        perimeterPoints.push([px, py]);

        ctx.save();
        ctx.fillStyle = '#261E17';
        ctx.strokeStyle = '#261E17';
        ctx.lineWidth = 1.4;

        // Station circle with center dot (⊙)
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny Bengali station number
        ctx.font = '600 12px "Noto Serif Bengali", serif';
        ctx.fillText(toBanglaDigits(stationNo++), px + 7, py - 4);
        ctx.restore();
      }
    }
  }

  // 8. Dag Numbers in Bangla digits (Neat penmanship, exactly like reference)
  ctx.save();
  ctx.font = '600 24px "Noto Serif Bengali", serif';
  ctx.fillStyle = '#261E17'; // Carbon dip-pen ink
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const feature of dags.features) {
    const dagId = String(feature.properties.id || feature.id);
    const bnNum = toBanglaDigits(dagId);

    try {
      const c = centroid(feature);
      const [cLng, cLat] = c.geometry.coordinates as [number, number];
      const [cPx, cPy] = projectCoord([cLng, cLat], mouza.sheetCorners, width, height);

      // Micro-rotation for natural hand-lettered feel (+/- 1.1 deg)
      const angle = (rng.next() - 0.5) * 0.038;
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

  // 9. Traditional Cartouche Box (Top-Left, matching reference style)
  ctx.save();
  const cX = 55;
  const cY = 48;
  const cW = 430;
  const cH = 158;

  // Background parchment fill
  ctx.fillStyle = '#E5D8C1';
  ctx.fillRect(cX, cY, cW, cH);

  // Double border
  ctx.strokeStyle = '#282019';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(cX, cY, cW, cH);

  ctx.lineWidth = 1.0;
  ctx.strokeRect(cX + 4, cY + 4, cW - 8, cH - 8);

  // Cartouche text
  ctx.fillStyle = '#201811';
  ctx.font = '600 21px "Noto Serif Bengali", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`মৌজা: ${mouza.nameBn} · জে.এল. নং ${toBanglaDigits(mouza.jlNo)}`, cX + 16, cY + 16);

  ctx.font = '500 14px "Noto Serif Bengali", serif';
  ctx.fillStyle = '#3E2E21';
  ctx.fillText(`উপজেলা: ${mouza.upazilaBn} · জেলা: ${mouza.districtBn}`, cX + 16, cY + 48);

  ctx.font = '500 13px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#5A432F';
  ctx.fillText('ক্যাডেল্ট্রাল জরিপ ডেমো নকশা · প্রদর্শনী সংস্করণ', cX + 16, cY + 72);

  ctx.font = '500 12px "Hind Siliguri", sans-serif';
  ctx.fillText('স্কেল: ১৬ ইঞ্চি = ১ মাইল (১:৩৯৬০)', cX + 16, cY + 94);

  // Scale bar (50m) inside cartouche
  const scale50mPx = calculateScaleBarPixels(50, mouza.center[1], mouza.sheetCorners, width);
  const barY = cY + 126;
  const barX = cX + 16;
  const barH = 7;

  ctx.strokeStyle = '#282019';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, scale50mPx, barH);

  // First 25m segment filled
  ctx.fillStyle = '#282019';
  ctx.fillRect(barX, barY, scale50mPx / 2, barH);

  // Scale tick labels
  ctx.font = '500 11px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#282019';
  ctx.textAlign = 'center';
  ctx.fillText('০', barX, barY - 5);
  ctx.fillText('২৫', barX + scale50mPx / 2, barY - 5);
  ctx.fillText('৫০ মি.', barX + scale50mPx, barY - 5);

  // North Arrow inside cartouche
  const arrowX = cX + cW - 42;
  const arrowY = cY + 72;
  const arrowLen = 38;

  ctx.strokeStyle = '#282019';
  ctx.fillStyle = '#282019';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY + arrowLen / 2);
  ctx.lineTo(arrowX, arrowY - arrowLen / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY - arrowLen / 2 - 8);
  ctx.lineTo(arrowX - 6, arrowY - arrowLen / 2 + 5);
  ctx.lineTo(arrowX, arrowY - arrowLen / 2);
  ctx.lineTo(arrowX + 6, arrowY - arrowLen / 2 + 5);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 15px "Noto Serif Bengali", serif';
  ctx.textAlign = 'center';
  ctx.fillText('উ', arrowX, arrowY - arrowLen / 2 - 12);

  ctx.restore();

  // 10. Authentic Legend Box ("সাংকেতিক", matching bottom-right of reference)
  ctx.save();
  const legW = 210;
  const legH = 175;
  const legX = width - legW - 48;
  const legY = height - legH - 45;

  ctx.fillStyle = '#E4D7BF';
  ctx.fillRect(legX, legY, legW, legH);

  ctx.strokeStyle = '#282019';
  ctx.lineWidth = 2.0;
  ctx.strokeRect(legX, legY, legW, legH);
  ctx.lineWidth = 0.9;
  ctx.strokeRect(legX + 3, legY + 3, legW - 6, legH - 6);

  ctx.font = 'bold 15px "Noto Serif Bengali", serif';
  ctx.fillStyle = '#261E17';
  ctx.textAlign = 'center';
  ctx.fillText('সাংকেতিক', legX + legW / 2, legY + 22);

  // Horizontal divider
  ctx.beginPath();
  ctx.moveTo(legX + 12, legY + 32);
  ctx.lineTo(legX + legW - 12, legY + 32);
  ctx.stroke();

  const legendRows = [
    { label: 'রাস্তা', symbol: 'road' },
    { label: 'সীমানা', symbol: 'border' },
    { label: 'পুকুর / ডোবা', symbol: 'pond' },
    { label: 'সীমানা পিলার', symbol: 'pillar' },
  ];

  ctx.textAlign = 'left';
  ctx.font = '500 13px "Noto Serif Bengali", serif';
  let curLegY = legY + 54;

  for (const item of legendRows) {
    ctx.fillStyle = '#261E17';
    ctx.fillText(item.label, legX + 18, curLegY);

    const symX = legX + legW - 55;
    if (item.symbol === 'road') {
      ctx.strokeStyle = '#282019';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(symX, curLegY - 5);
      ctx.lineTo(symX + 36, curLegY - 5);
      ctx.moveTo(symX, curLegY - 1);
      ctx.lineTo(symX + 36, curLegY - 1);
      ctx.stroke();
    } else if (item.symbol === 'border') {
      ctx.strokeStyle = '#282019';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 3, 2, 3]);
      ctx.beginPath();
      ctx.moveTo(symX, curLegY - 3);
      ctx.lineTo(symX + 36, curLegY - 3);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (item.symbol === 'pond') {
      ctx.strokeStyle = '#282019';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(symX, curLegY - 9, 32, 13);
      ctx.strokeRect(symX + 4, curLegY - 6, 24, 7);
    } else if (item.symbol === 'pillar') {
      ctx.strokeStyle = '#282019';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(symX + 16, curLegY - 3, 4.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(symX + 16, curLegY - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    curLegY += 28;
  }
  ctx.restore();

  // 11. Government Settlement Officer Approval Box (matching reference photo)
  ctx.save();
  const stlW = 340;
  const stlH = 100;
  const stlX = legX - stlW - 24;
  const stlY = height - stlH - 45;

  ctx.fillStyle = '#E4D7BF';
  ctx.fillRect(stlX, stlY, stlW, stlH);

  ctx.strokeStyle = '#282019';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(stlX, stlY, stlW, stlH);

  ctx.font = '500 10.5px sans-serif';
  ctx.fillStyle = '#261E17';
  ctx.textAlign = 'center';
  ctx.fillText('APPROVED UNDER PROVISION OF STATE ACQUISITION ACT', stlX + stlW / 2, stlY + 18);
  ctx.fillText('ASST. SETTLEMENT OFFICER & SUPERINTENDENT OF SURVEY', stlX + stlW / 2, stlY + 34);

  // Handwritten cursive signature
  ctx.font = 'italic 16px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#1D1711';
  ctx.fillText('S. K. Roy  (১৪/০৪/১৯৮৭)', stlX + stlW / 2, stlY + 60);

  ctx.font = '400 9px sans-serif';
  ctx.fillStyle = '#4A3B2E';
  ctx.fillText(
    'MADE UNDER THE AUTHORITY OF DIRECTOR OF LAND RECORDS & SURVEYS',
    stlX + stlW / 2,
    stlY + 84,
  );
  ctx.restore();

  // 12. Cadastral Schedule Table ("দাগ ও খতিয়ান সূচি", matching bottom-left of reference)
  ctx.save();
  const tblW = 320;
  const tblH = 135;
  const tblX = 55;
  const tblY = height - tblH - 45;

  ctx.fillStyle = '#E4D7BF';
  ctx.fillRect(tblX, tblY, tblW, tblH);

  ctx.strokeStyle = '#282019';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(tblX, tblY, tblW, tblH);

  ctx.font = 'bold 12.5px "Noto Serif Bengali", serif';
  ctx.fillStyle = '#261E17';
  ctx.textAlign = 'center';
  ctx.fillText('দাগ ও খতিয়ান তফসিল (নমুনা)', tblX + tblW / 2, tblY + 18);

  // Table grid
  const colX = [tblX, tblX + 65, tblX + 145, tblX + 225, tblX + tblW];
  const rowY = [tblY + 28, tblY + 48, tblY + 68, tblY + 88, tblY + 108, tblY + tblH];

  ctx.lineWidth = 0.8;
  for (const y of rowY) {
    ctx.beginPath();
    ctx.moveTo(tblX, y);
    ctx.lineTo(tblX + tblW, y);
    ctx.stroke();
  }
  for (const x of colX) {
    ctx.beginPath();
    ctx.moveTo(x, tblY + 28);
    ctx.lineTo(x, tblY + tblH);
    ctx.stroke();
  }

  // Table Headers
  ctx.font = '600 11px "Noto Serif Bengali", serif';
  ctx.fillText('দাগ নং', (colX[0]! + colX[1]!) / 2, tblY + 42);
  ctx.fillText('খতিয়ান', (colX[1]! + colX[2]!) / 2, tblY + 42);
  ctx.fillText('শ্রেণি', (colX[2]! + colX[3]!) / 2, tblY + 42);
  ctx.fillText('পরিমাণ', (colX[3]! + colX[4]!) / 2, tblY + 42);

  // Table Rows (Sample entries matching scenarios)
  const sampleRows = [
    { dag: '১০১', khatian: '০১', cls: 'ভিটা', area: '০.৩০' },
    { dag: '১০২', khatian: '০২', cls: 'ভিটা', area: '০.২৫' },
    { dag: '১০৩', khatian: '০৩', cls: 'নাল', area: '০.৩০' },
    { dag: '১০৪', khatian: '০৪', cls: 'ভিটা', area: '০.২৮' },
  ];

  ctx.font = '500 11px "Noto Serif Bengali", serif';
  sampleRows.forEach((r, idx) => {
    const yCenter = rowY[idx + 1]! + 14;
    ctx.fillText(r.dag, (colX[0]! + colX[1]!) / 2, yCenter);
    ctx.fillText(r.khatian, (colX[1]! + colX[2]!) / 2, yCenter);
    ctx.fillText(r.cls, (colX[2]! + colX[3]!) / 2, yCenter);
    ctx.fillText(r.area, (colX[3]! + colX[4]!) / 2, yCenter);
  });

  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  cachedDataUrl = dataUrl;
  cachedKey = currentKey;

  return dataUrl;
}
