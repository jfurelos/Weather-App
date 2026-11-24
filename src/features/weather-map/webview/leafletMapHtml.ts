import { AppTheme } from '@/shared/theme/themes';

export function getLeafletMapHtml(theme: AppTheme, apiKey?: string): string {
  const isDark = theme.isDark;
  const { colors, metrics } = theme;
  const cartoKey = apiKey || process.env.EXPO_PUBLIC_CARTO_API_KEY;

  // Si el usuario tiene una API key gratuita de CARTO, usamos sus tiles limpios.
  // Si no la tiene aún, usamos OpenStreetMap (100% libre, sin registro ni clave).
  const encodedCartoKey = cartoKey ? encodeURIComponent(cartoKey) : '';
  const baseTileUrl = encodedCartoKey
    ? (isDark
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodedCartoKey}`
        : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${encodedCartoKey}`)
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const bgColor = colors.background;
  const textColor = colors.textPrimary;
  const cardBg = colors.card;
  const borderColor = colors.border;
  const borderWidth = `${metrics.windowBorderWidth}px`;
  const blurPx = `${metrics.glassBlur}px`;
  const tileFilter =
    !cartoKey && isDark
      ? 'filter: invert(92%) hue-rotate(185deg) brightness(86%) contrast(92%);'
      : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Radar Meteorológico</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: ${bgColor}; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
    .leaflet-tile-pane .base-tiles { ${tileFilter} }
    .leaflet-control-attribution { font-size: 9px !important; background: ${cardBg} !important; color: ${textColor} !important; }
    .radar-legend {
      position: absolute;
      bottom: 20px;
      left: 12px;
      z-index: 1000;
      background: ${cardBg};
      backdrop-filter: blur(${blurPx});
      -webkit-backdrop-filter: blur(${blurPx});
      border-radius: 14px;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(51,92,103,0.18);
      font-size: 11px;
      color: ${textColor};
      font-weight: 700;
      border: ${borderWidth} solid ${borderColor};
    }
    .legend-gradient {
      width: 72px;
      height: 8px;
      border-radius: 99px;
      background: linear-gradient(90deg, #FFF3B0 0%, #E09F3E 45%, #9E2A2B 78%, #540B0E 100%);
    }
    .leaflet-bar {
      border: ${borderWidth} solid ${borderColor} !important;
      box-shadow: 0 4px 12px rgba(40,50,62,0.14) !important;
      border-radius: 12px !important;
      overflow: hidden;
    }
    .leaflet-bar a {
      background-color: ${cardBg} !important;
      color: ${textColor} !important;
      border-bottom: 1px solid ${borderColor} !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="radar-legend">
    <span>Lluvia</span>
    <div class="legend-gradient"></div>
    <span>Intensa</span>
  </div>

  <script>
    var map = L.map('map', {
      center: [40.2, -3.7],
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('${baseTileUrl}', {
      subdomains: '${cartoKey ? 'abcd' : 'abc'}',
      maxZoom: 19,
      className: 'base-tiles'
    }).addTo(map);

    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          var latestFrame = data.radar.past[data.radar.past.length - 1];
          var radarUrl = 'https://tilecache.rainviewer.com' + latestFrame.path + '/256/{z}/{x}/{y}/2/1_1.png';
          L.tileLayer(radarUrl, {
            opacity: 0.65,
            zIndex: 100
          }).addTo(map);
        }
      })
      .catch(function(err) {
        console.warn('Error cargando tiles de RainViewer:', err);
      });
  </script>
</body>
</html>`;
}
