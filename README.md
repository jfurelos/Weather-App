# Clima & Comunidad España (MVP)

Aplicación móvil multiplataforma desarrollada en **React Native con Expo SDK 52 (TypeScript)**, con estética minimalista inspirada en **Airbnb** (modo claro y oscuro), que combina pronóstico meteorológico en tiempo real, radar interactivo gratuito y foros comunitarios organizados por provincia y comarca en España.

---

## Funcionalidades Principales

- **Acceso Inicial Flexible:** Pantalla de bienvenida con **Iniciar sesión**, **Registrarse** (Supabase Auth) o **Continuar como invitado** (acceso a pronóstico, radar y perfil, sin acceso a los foros).
- **Inicio (Pronóstico y Consejos):** Clima actual en tiempo real con **Open-Meteo**, timeline horario de 24h, motor de consejos diarios de vestimenta y planes, selector de ciudades españolas y avisos destacados.
- **Noticias & Radar:** Selector de 7 días, boletines meteorológicos oficiales y mapa interactivo con **Leaflet.js + OpenStreetMap + RainViewer** (con modal a pantalla completa y soporte opcional de CARTO).
- **Comunidad (Foros Provinciales y Comarcales):**
  - Foro independiente para cada una de las **50 provincias de España**.
  - Buscador de subforos por **comarca** y acceso rápido a hasta **3 comarcas favoritas**.
  - **3 chats fijos** por comarca (*General*, *Accidentes y problemas* y *Cielo y Paisajes*), cada uno con mensaje explicativo de 1 línea al entrar y sistema de reporte/moderación.
- **Perfil y Alertas Personalizadas:**
  - Edición de foto/avatar y provincia (sincronizada con la comunidad).
  - **Ubicación fija única** editable mediante buscador de municipios/capitales de España (sincronizada con Inicio y Supabase).
  - Toggles, umbrales configurables y **tonos diferenciados** con prueba de sonido en vivo para **Lluvia torrencial**, **Viento y temporales** y **Calor extremo**.
  - Selector persistente de **Modo Claro / Modo Oscuro**.

---

## Requisitos Previos

- **Node.js** v18 o superior.
- **npm** (incluido con Node.js).
- **Expo Go** en Android/iOS o navegador web moderno para vista previa.
- Proyecto gratuito en [Supabase](https://supabase.com) (sin tarjeta de crédito).

---

## Instalación y Puesta en Marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `.env.example` a `.env` y completa tus credenciales:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
EXPO_PUBLIC_APP_ENV=development

# Opcional (gratuita en https://carto.com/basemaps/apikey).
# Si se deja vacía, el mapa usa OpenStreetMap automáticamente.
EXPO_PUBLIC_CARTO_API_KEY=
```

> **Seguridad:** Nunca incluyas claves `service_role` en `.env`.

### 3. Verificación y Ejecución
```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Iniciar servidor Expo (móvil / emulador)
npx expo start

# Exportar build web estática en dist/
npx expo export -p web
```

---

## Servicios Gratuitos Integrados (Zero Credit Card)

- **Pronóstico Meteorológico:** [Open-Meteo](https://open-meteo.com) (sin clave ni tarjeta).
- **Radar de Precipitación:** API pública de [RainViewer](https://www.rainviewer.com/api.html).
- **Cartografía Base:** [OpenStreetMap](https://www.openstreetmap.org) por defecto (o CARTO gratuito opcional).
- **Backend, Auth y DB:** [Supabase Free Tier](https://supabase.com) (PostgreSQL + PostGIS + Auth + Realtime).

---

## Estructura del Proyecto (Feature-Sliced Design)

```text
src/
├── app/
│   ├── navigation/          # RootNavigator, BottomTabNavigator y tipos de rutas
│   └── providers/           # AppProvider (hidratación de tema y perfil)
├── features/
│   ├── auth/                # WelcomeAuthScreen (Login, Registro, Invitado)
│   ├── home/                # Clima actual, timeline 24h, rulesEngine y noticias
│   ├── weather-map/         # Leaflet + RainViewer, selector 7 días y boletines
│   ├── community/           # 50 provincias, comarcas, favoritas, 3 chats y reportes
│   └── profile/             # Perfil, ubicación fija única, umbrales, tonos y AuthModal
└── shared/
    ├── api/                 # Cliente singleton de Supabase
    ├── components/          # UI Kit Airbnb (Typography, Card, Button, Badge)
    ├── store/               # useThemeStore (Claro/Oscuro persistido)
    └── theme/               # Tokens de color, espaciado y tipografía
```

Para más detalle de arquitectura y reglas de negocio, consulta [context.md](file:///c:/Users/jfure/Documents/Idearium/App/context.md).
