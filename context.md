# Contexto del Proyecto: Aplicación Meteorológica y Comunidad (España)

*Documento vivo de arquitectura, decisiones de diseño, reglas de negocio y estado del proyecto.*

---

## 1. Visión y Propósito
Aplicación móvil en **React Native (Expo SDK)** dirigida a usuarios en España (Península y Baleares). Combina:
1. **Utilidad Meteorológica de Alta Precisión:** Pronósticos horarios, radar interactivo en tiempo real y alertas geolocalizadas personalizadas (estilo ES-Alert) para ubicaciones fijas del usuario.
2. **Red Social y Comunidad Local:** Foros organizados por categorías fijas para debatir sobre eventos meteorológicos, compartir partes locales y consultar incidencias.
3. **Recomendaciones Inteligentes:** Consejos de ropa y actividades basados en una matriz de reglas predefinidas según las condiciones actuales.

---

## 2. Principios de Diseño Visual (Referencia: Airbnb)
- **Minimalismo y Pulcritud:** Ausencia total de bordes gruesos o tarjetas saturadas. Espaciado generoso basado en un grid de 8pt (paddings típicos de 16px, 20px, 24px).
- **Tipografía y Jerarquía:** Textos limpios con alto contraste y pesos diferenciados (Regular, Medium, SemiBold). Textos secundarios en gris suave (`#717171` en modo claro, `#A0A0A0` en modo oscuro).
- **Elevación Sutil:** Sombras muy suaves y desenfocadas para simular profundidad natural (`shadowOpacity: 0.05-0.08`, `elevation: 2`).
- **Paleta de Color Semántica:** Tonos desaturados y elegantes para niveles de alerta (lluvia, viento, calor) y soporte dual nativo de **Modo Claro** y **Modo Oscuro** con toggle manual en perfil.

---

## 3. Reglas de Negocio por Módulo

### 3.1. Inicio (Home)
- **Noticias Destacadas:** Carrusel horizontal o tarjeta principal con avisos meteorológicos destacados de fuentes oficiales.
- **Pronóstico Diario:** Timeline horizontal con scroll fluido que muestra temperatura, icono de clima y probabilidad de lluvia por horas.
- **Consejo del Día (Rules Engine):**
  - Evalúa la temperatura actual, rachas de viento y precipitación.
  - Genera recomendaciones de vestimenta (ej. *Capas ligeras y paraguas compacto*, *Abrigo térmico y cortavientos*) y planes (ej. *Ideal para actividades al aire libre*, *Evitar zonas expuestas a viento*).

### 3.2. Noticias & Radar
- **Feed Oficial:** Partes y avisos sincronizados con fuentes oficiales (AEMET / Meteocat vía Supabase).
- **Selector de Días:** Filtro rápido por días de la semana para previsualizar previsiones y comunicados.
- **Visor de Mapa / Radar:**
  - Incrustado en la pantalla mediante `react-native-webview` utilizando **Leaflet.js + CartoDB Positron**.
  - Capa de radar meteorológico en tiempo real proporcionada por la API abierta de **RainViewer**.
  - Botón interactivo para expandir el mapa a **Pantalla Completa (Full Screen Modal)**.

### 3.3. Comunidad / Foro
- **Categorías Fijas:** Creadas y gestionadas exclusivamente por administradores en la base de datos (ej. *Previsión General*, *Temporales y Alertas*, *Nieve y Montaña*, *Fotografía Meteorológica*, *Consultas Locales*). Los usuarios no pueden crear categorías.
- **Hilos y Mensajería Realtime:** Chat fluido estilo iMessage / Airbnb conectado mediante Supabase Realtime Channels.
- **Moderación Comunitaria:**
  - Cada mensaje incluye un botón de **Reportar**.
  - Al reportar: el mensaje se oculta inmediatamente de forma local para el usuario que reporta (`reported_messages` en store local), y se crea un registro en la tabla `reports` de Supabase para su resolución manual desde el dashboard web.

### 3.4. Perfil y Alertas
- **Gestión de Identidad:** Nombre, Foto de perfil, Provincia asignada, Email y Contraseña.
- **Privacidad Estricta:** Solo el Nombre, Foto y Provincia son públicos dentro del foro y mensajes. El Email y la contraseña son completamente privados.
- **Edición de Perfil:** Se permite editar Foto y Provincia; el Email y el Nombre de usuario permanecen inmutables tras el registro para mantener la integridad comunitaria.
- **Ubicaciones Fijas para Alertas:**
  - El usuario puede guardar hasta un máximo de ubicaciones fijas (ej. *Mi Casa - Madrid*, *Pueblo - Ávila*).
  - Almacenamiento en Supabase con soporte PostGIS (`geography(Point, 4326)`).
- **Configuración de Alertas Personalizadas:**
  - Toggles y umbrales por tipo de evento: Viento (> 50 km/h, > 70 km/h), Lluvia (Avisos amarillos/naranjas), Calor Extremo (> 35°C, > 40°C).
  - Reproducción de sonidos específicos por tipología de alerta usando `expo-av`.

---

## 4. Stack Tecnológico y Restricciones

| Área | Tecnología Elegida | Justificación / Restricción |
| :--- | :--- | :--- |
| **Framework Móvil** | React Native + Expo SDK (TypeScript) | Soporte nativo para iOS/Android sin fricciones de toolchain. |
| **Navegación** | React Navigation (Bottom Tabs + Native Stack) | Modularidad estándar de la industria. |
| **Estado Global** | Zustand | Stores atómicos, ligeros y desacoplados por módulo. |
| **BaaS / Base de Datos** | Supabase (PostgreSQL + PostGIS + Auth + Realtime) | Free tier sin tarjeta de crédito. Gestión web nativa. |
| **Mapas & Radar** | `react-native-webview` + Leaflet + RainViewer | 100% open-source, sin APIs comerciales con tarjeta (Mapbox descartado). |
| **Datos Meteorológicos** | Open-Meteo API + AEMET OpenData | Modelos ECMWF/ICON de alta resolución para España, gratuitos sin tarjeta. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) / Expo Notifications | Notificaciones push de alta prioridad para alertas a ubicaciones fijas. |

---

## 5. Modelo de Datos Relacional (Supabase / PostgreSQL)

```sql
-- Perfiles de usuario (complemento de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ubicaciones fijas para alertas del usuario
CREATE TABLE user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(Point, 4326),
  notify_rain BOOLEAN DEFAULT TRUE,
  notify_wind BOOLEAN DEFAULT TRUE,
  notify_heat BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías fijas de foros (solo administradores)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foros o canales de debate
CREATE TABLE forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  province_code TEXT, -- Opcional, para foros provinciales
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes en tiempo real
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reportes de moderación comunitaria
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Estado Actual del Proyecto
- [x] **Fase 1: Arquitectura y Planificación** (Completada y aprobada).
- [x] **Fase 2: Documentación Inicial y Base de Datos** (Completada: `context.md`, `README.md`, `.env`, tablas creadas en Supabase con PostGIS y Realtime activo).
- [x] **Fase 3: Scaffolding y Navegación** (Completada: Proyecto Expo SDK 52 con TypeScript estricto, estructura FSD, sistema de diseño Airbnb Claro/Oscuro con Zustand, cliente Supabase singleton y 4 Bottom Tabs funcionales).
- [ ] **Fase 4: Desarrollo Iterativo por Módulos:**
  - [x] **Pestaña 1: Inicio (Home)** (Completada: Conexión en tiempo real con Open-Meteo para España, timeline horizontal por horas con probabilidad de lluvia, motor de reglas para ropa y planes, avisos destacados y selector modal de ciudades).
  - [ ] **Pestaña 2: Noticias & Radar** (Próximo: Visor interactivo Leaflet.js / RainViewer en `react-native-webview`, modal de pantalla completa y selector de días).
  - [ ] **Pestaña 3: Foros y Comunidad** (Chat en tiempo real, categorías fijas y reportes con ocultamiento local).
  - [ ] **Pestaña 4: Perfil y Alertas** (Gestión de ubicaciones fijas, umbrales y sonidos de alerta).
