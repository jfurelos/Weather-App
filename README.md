# Clima & Comunidad España (MVP Móvil)

Aplicación móvil desarrollada en **React Native con Expo SDK (TypeScript)**, inspirada en la línea de diseño minimalista de **Airbnb**, que combina pronóstico meteorológico avanzado, mapas interactivos sin costes de tarjeta y una comunidad local en tiempo real con alertas de proximidad.

---

## 🚀 Requisitos Previos

- **Node.js**: Versión LTS (v18.x o superior).
- **Gestor de Paquetes**: `npm`, `pnpm` o `yarn`.
- **Dispositivo de Pruebas**: Aplicación móvil **Expo Go** instalada en tu teléfono (Android / iOS) o emulador de Android Studio / simulador de Xcode.
- **Cuenta de Supabase**: Cuenta gratuita en [supabase.com](https://supabase.com) (no requiere tarjeta de crédito).

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar o acceder al proyecto
```bash
cd c:\Users\jfure\Documents\Idearium\App
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo para crear tu entorno local:
```bash
cp .env.example .env
```
Rellena las credenciales obtenidas de tu proyecto en Supabase (ver sección siguiente).

### 4. Iniciar el servidor de desarrollo Expo
```bash
npx expo start
```
- Presiona **`a`** para abrir en emulador de Android.
- Presiona **`i`** para abrir en simulador de iOS.
- Escanea el código QR desde la app **Expo Go** en tu dispositivo físico.

---

## 🔐 Configuración de Variables de Entorno (`.env`)

El archivo `.env` en la raíz del proyecto debe contener:

```env
# URL base de tu proyecto Supabase (Project Settings > API)
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Llave anónima pública de Supabase (Project Settings > API > anon public)
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Entorno de ejecución
EXPO_PUBLIC_APP_ENV=development
```

> **Nota de Seguridad:** Las variables con el prefijo `EXPO_PUBLIC_` son accesibles en el bundle del cliente móvil. Nunca expongas la clave `service_role` de Supabase en este archivo.

---

## 🗄️ Configuración de la Base de Datos (Supabase)

1. Inicia sesión en el [Dashboard de Supabase](https://supabase.com/dashboard).
2. Crea un nuevo proyecto (ej. `clima-comunidad-espana`).
3. Ve a la pestaña **SQL Editor** en el menú lateral izquierdo.
4. Ejecuta el script de migración inicial definido en `context.md` (o en `supabase/migrations/01_initial_schema.sql` si existe) para crear las tablas:
   - `profiles`
   - `user_locations`
   - `categories`
   - `forums`
   - `messages`
   - `reports`
5. Habilita **Realtime** para la tabla `messages` en **Database > Publications > supabase_realtime**.

---

## 🗺️ Servicios Gratuitos Integrados (Zero Credit Card)

- **Mapas:** Motor Leaflet.js con capas de mapa base CartoDB Positron / OpenStreetMap renderizadas dentro de `react-native-webview`.
- **Radar de Lluvias:** API pública de tiles de radar de [RainViewer](https://www.rainviewer.com/api.html) (sin clave, sin coste).
- **Pronóstico:** API abierta de [Open-Meteo](https://open-meteo.com) con modelos DWD/ECMWF para la península y Baleares.
- **Backend:** Supabase Free Tier (PostgreSQL + PostGIS + Auth + Realtime).
- **Notificaciones Push:** Firebase Cloud Messaging (Spark Free Tier).

---

## 📁 Estructura del Proyecto

Seguimos una arquitectura modular **Feature-Sliced Design (FSD)**:

```text
src/
├── app/               # Enrutadores, Navigation y Providers globales
├── features/          # Módulos aislados funcionalmente
│   ├── home/          # Pronóstico por horas, titulares y consejo del día
│   ├── weather-map/   # Visor de radar Leaflet y avisos oficiales
│   ├── community/     # Foros temáticos, chat en tiempo real y reportes
│   ├── profile/       # Perfil, ubicaciones fijas, alertas y tema claro/oscuro
│   └── auth/          # Login, registro y sesión
└── shared/            # Componentes atómicos Airbnb, hooks, clientes y tokens de tema
```

---

## 📖 Documentación Viva

Para consultar las reglas de negocio detalladas, decisiones de arquitectura y la matriz de recomendaciones, revisa [context.md](file:///c:/Users/jfure/Documents/Idearium/App/context.md).
