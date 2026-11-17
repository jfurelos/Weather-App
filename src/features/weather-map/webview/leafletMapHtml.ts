export function getLeafletMapHtml(themeMode: 'light' | 'dark', apiKey?: string): string {
  const isDark = themeMode === 'dark';
  const cartoKey = apiKey || process.env.EXPO_PUBLIC_CARTO_API_KEY;

  // Si el usuario tiene una API key gratuita de CARTO, usamos sus tiles limpios.
  // Si no la tiene aún, usamos OpenStreetMap (100% libre, sin registro ni clave).
  const baseTileUrl = cartoKey
    ? (isDark
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`)
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const bgColor = isDark ? '#181614' : '#FBF8F3';
  const textColor = isDark ? '#F7F3EC' : '#2A2623';
  const cardBg = isDark ? 'rgba(38,34,31,0.9)' : 'rgba(255,253,249,0.9)';

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
    html, body, #map { width: 100%; height: 100%; background: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }
    .leaflet-control-attribution { font-size: 9px !important; background: ${cardBg} !important; color: ${textColor} !important; }
    .radar-legend {
      position: absolute;
      bottom: 24px;
      left: 12px;
      z-index: 1000;
      background: ${cardBg};
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-size: 11px;
      color: ${textColor};
      font-weight: 500;
      border: 1px solid ${isDark ? '#36312C' : '#EAE2D4'};
    }
    .legend-gradient {
      width: 70px;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(to right, #7bc8f6, #3b82f6, #eab308, #ef4444);
    }
    .leaflet-bar { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; border-radius: 8px !important; overflow: hidden; }
    .leaflet-bar a { background-color: ${cardBg} !important; color: ${textColor} !important; border-bottom: 1px solid ${isDark ? '#36312C' : '#EAE2D4'} !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="radar-legend">
    <span>Radar de lluvia</span>
    <div class="legend-gradient"></div>
    <span>Fuerte</span>
  </div>

  <script>
    // Inicializar mapa centrado en España
    var map = L.map('map', {
      center: [40.2, -3.7],
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Capa base
    L.tileLayer('${baseTileUrl}', {
      subdomains: '${cartoKey ? 'abcd' : 'abc'}',
      maxZoom: 19
    }).addTo(map);

    // Conectar a la API pública y gratuita de RainViewer para obtener la última pasada del radar
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          // Último frame disponible
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
