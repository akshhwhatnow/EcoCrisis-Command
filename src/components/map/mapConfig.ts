import { setWorkerUrl, RequestParameters, ResourceType } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

// Configure MapLibre web worker for Vite build
try {
  setWorkerUrl(workerUrl);
} catch (e) {
  // Worker already initialized
}

/**
 * OpenFreeMap serves glyphs exclusively under single Noto Sans font families:
 * - Noto Sans Regular
 * - Noto Sans Bold
 * - Noto Sans Italic
 *
 * MapLibre and legacy vector styles frequently request composite font stacks
 * (e.g., "Open Sans Semibold,Arial Unicode MS Bold" or "Open Sans Bold,Arial Unicode MS Bold")
 * which return HTTP 404 from the OpenFreeMap font server.
 *
 * This transform maps any glyph request to the corresponding available Noto Sans weight.
 */
export function transformMapRequest(url: string, resourceType?: ResourceType): RequestParameters {
  if (resourceType === 'Glyphs' || url.includes('/fonts/')) {
    const fontMatch = url.match(/\/fonts\/([^/]+)\/([0-9]+-[0-9]+\.pbf)/);
    if (fontMatch) {
      const rawFont = decodeURIComponent(fontMatch[1]);
      const range = fontMatch[2];

      let targetFont = 'Noto Sans Regular';
      if (/bold|semibold|medium|700|600/i.test(rawFont)) {
        targetFont = 'Noto Sans Bold';
      } else if (/italic/i.test(rawFont)) {
        targetFont = 'Noto Sans Italic';
      }

      return {
        url: `https://tiles.openfreemap.org/fonts/${encodeURIComponent(targetFont)}/${range}`,
      };
    }
  }
  return { url };
}

export const MAP_CONFIG = {
  // Center on Wildfire & Compound Crisis Operational Valley (Northern California Lake/Middletown Region)
  defaultCenter: [121.215, 14.845] as [number, number],
  defaultZoom: 5,
  minZoom: 2,
  maxZoom: 18,
  pitch: 25,
  bearing: -10,

  // OpenFreeMap styles
  styles: {
    dark: 'https://tiles.openfreemap.org/styles/positron', // Clean high-contrast vector base
    light: 'https://tiles.openfreemap.org/styles/liberty',  // Detailed topographic & road vector base
    satellite: 'https://tiles.openfreemap.org/styles/liberty',
  }
};
