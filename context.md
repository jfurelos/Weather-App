# Contexto del Proyecto: Clima & Comunidad España (MVP)

*Documento vivo de arquitectura, decisiones de diseño, reglas de negocio y estado final del MVP.*

---

## 1. Visión y Propósito
Aplicación móvil multiplataforma en **React Native con Expo SDK 52 (TypeScript)** dirigida a usuarios en España. Combina:
1. **Utilidad Meteorológica:** Pronósticos horarios en tiempo real (Open-Meteo), mapa radar interactivo (Leaflet + RainViewer) y alertas personalizadas para la ubicación fija del usuario.
2. **Comunidad Local por Provincia y Comarca:** Foros provinciales con subforos por comarca, acceso rápido a comarcas favoritas y 3 chats fijos por comarca con moderación comunitaria.
3. **Recomendaciones Inteligentes:** Consejos de vestimenta y planes evaluados por un motor de reglas según temperatura, viento y precipitación.

---

## 2. Principios de Diseño Visual (Referencia: Airbnb)
- **Minimalismo y Pulcritud:** Ausencia de bordes gruesos o sobrecarga textual. Espaciado generoso en grid de 8pt (`16px`, `20px`, `24px`).
- **Tipografía y Jerarquía:** Contraste nítido en encabezados y cuerpo; textos secundarios suaves (`#717171` claro / `#A0A0A0` oscuro) sin etiquetas superiores redundantes.
- **Elevación Sutil:** Sombras suaves (`shadowOpacity: 0.06`, `elevation: 2`) y radios redondeados (`borderRadius: 16`).
- **Modo Claro y Modo Oscuro:** Cambio manual desde Perfil con persistencia local en `AsyncStorage`.

---

## 3. Reglas de Negocio por Módulo

### 3.0. Acceso Inicial (`WelcomeAuthScreen`)
- Al abrir la app sin sesión activa se muestran 3 opciones:
  1. **Iniciar sesión** (Supabase Auth).
  2. **Registrarse** (Nombre, usuario, provincia, email y contraseña en Supabase Auth).
  3. **Continuar como invitado** (accede a Inicio, Noticias & Radar y Perfil, **sin acceso a los foros**).
- Al completar cualquiera de las opciones se accede a la app principal. Si el usuario invitado inicia sesión o se registra desde Perfil, la pestaña **Comunidad** se desbloquea de inmediato; al cerrar sesión se vuelve a la pantalla inicial de acceso.

### 3.1. Inicio (`HomeScreen`)
- **Clima Actual y Selector de Ciudad:** Datos en tiempo real de Open-Meteo sincronizados con la ubicación fija del perfil (y selector rápido de ciudades españolas).
- **Pronóstico 24h:** Timeline horizontal con temperatura, icono climático y probabilidad de precipitación por hora.
- **Consejo del Día (`rulesEngine.ts`):** Recomendaciones automáticas de vestimenta y planes según temperatura, viento y lluvia.
- **Avisos Destacados:** Resumen de avisos oficiales con acceso directo a la pestaña de Noticias & Mapa.

### 3.2. Noticias & Radar (`WeatherMapScreen`)
- **Selector de 7 Días:** Permite consultar previsiones y comunicados por día de la semana.
- **Mapa Interactivo (`Leaflet.js` + `RainViewer`):**
  - Mapa base abierto con **OpenStreetMap** por defecto (cero marcas de agua y sin tarjeta) y soporte opcional de **CARTO Positron/Dark Matter** mediante `EXPO_PUBLIC_CARTO_API_KEY`.
  - Capa de radar de precipitación en tiempo real mediante la API pública de **RainViewer**.
  - Modal de mapa a **pantalla completa** (`FullScreenMapModal`).
- **Boletines Oficiales:** Feed de comunicados meteorológicos de fuentes oficiales (AEMET, Meteocat).

### 3.3. Comunidad / Foros (`ForumListScreen`, `ComarcaDetailScreen`, `ChatConversationScreen`)
- **Acceso Exclusivo para Usuarios Registrados:** Oculto y bloqueado en modo invitado.
- **Jerarquía Provincia → Comarca → 3 Chats:**
  - Cada una de las **50 provincias de España** dispone de su propio foro provincial; cambiar de provincia cambia de foro.
  - Buscador integrado de subforos por **comarca** dentro de la provincia activa.
  - **Comarcas Favoritas:** Hasta un máximo de **3 comarcas favoritas** persistidas localmente, mostradas las 3 simultáneamente en la sección **Favoritas** para acceso directo.
  - Al abrir cualquier comarca se muestran siempre los mismos **3 chats fijos**:
    1. **General**
    2. **Accidentes y problemas**
    3. **Cielo y Paisajes**
  - Cada chat muestra en la cabecera un **mensaje predeterminado de 1 línea** explicando su temática.
- **Moderación Comunitaria:**
  - Los mensajes muestran nombre y provincia pública del autor.
  - Cada mensaje de otro usuario dispone de botón de **Reportar** (`ReportMessageModal`): oculta el mensaje al instante de forma local y registra el reporte en la tabla `reports` de Supabase.

### 3.4. Perfil y Alertas (`ProfileScreen`)
- **Identidad y Privacidad:**
  - Nombre, foto/avatar (color o URL) y provincia son visibles en los foros; email y contraseña permanecen privados.
  - En cuentas registradas, email y nombre permanecen inmutables; foto y provincia se editan libremente y se sincronizan automáticamente con los foros.
- **Ubicación Fija Única:**
  - El usuario mantiene **exactamente 1 ubicación fija** para alertas meteorológicas. Para cambiarla, modifica la existente mediante buscador de municipios/capitales de España (`EditLocationModal`), sincronizando además con Inicio y con `user_locations` en Supabase.
- **Alertas Personalizadas y Tonos Diferenciados:**
  - Switches independientes para **Lluvia torrencial**, **Viento y temporales** y **Calor extremo**.
  - Modal de **Umbrales y Tonos de Alerta** (`AlertSettingsModal`) con umbrales ajustables (Amarillo/Naranja/Rojo, `> 50/70/90 km/h`, `> 34/36/40°C`) y tonos diferenciados por fenómeno con reproducción de vista previa en vivo (`alertSoundService.ts`).

---

## 4. Stack Tecnológico y Restricción Zero-Credit-Card

| Área | Tecnología | Motivo |
| :--- | :--- | :--- |
| **Framework** | React Native + Expo SDK 52 (TypeScript estricto) | Desarrollo ágil para Android, iOS y Web preview. |
| **Navegación** | React Navigation (Bottom Tabs + Native Stack) | Navegación modular con control de acceso por sesión. |
| **Estado Global** | Zustand + `AsyncStorage` | Stores ligeros, desacoplados y con persistencia local. |
| **Backend & DB** | Supabase Free Tier (PostgreSQL + PostGIS + Auth + Realtime) | Sin tarjeta bancaria; gestión completa desde dashboard. |
| **Mapas & Radar** | `react-native-webview` + Leaflet 1.9.4 + OpenStreetMap + RainViewer | 100% gratuito, sin APIs comerciales con tarjeta. |
| **Meteorología** | Open-Meteo API | Modelos de alta precisión para España, gratuito y abierto. |
| **Audio de Alertas** | Web Audio API / `expo-av` | Tonos diferenciados con preescucha sin dependencias externas. |

---

## 5. Modelo de Datos Relacional (Supabase / PostgreSQL)
Esquema desplegado en Supabase (ver `supabase/migrations/01_initial_schema.sql`):
- `profiles`: `id`, `username`, `full_name`, `avatar_url`, `province`, timestamps.
- `user_locations`: `id`, `user_id`, `name`, `latitude`, `longitude`, `geom` (`GEOGRAPHY(Point, 4326)` con trigger PostGIS), `notify_rain`, `notify_wind`, `notify_heat`.
- `categories`, `forums`, `messages` (Realtime habilitado) y `reports` (moderación comunitaria).
- Políticas **RLS (Row Level Security)** activas en todas las tablas.

---

## 6. Estado de Fases
- [x] **Fase 1:** Arquitectura, stack zero-credit-card y plan técnico.
- [x] **Fase 2:** Documentación inicial y despliegue de esquema PostgreSQL + PostGIS + RLS en Supabase.
- [x] **Fase 3:** Scaffolding Expo TypeScript, tokens Airbnb Claro/Oscuro y navegación base.
- [x] **Fase 4 - Módulo 1:** Inicio (Open-Meteo, timeline 24h, motor de consejos, selector de ciudad).
- [x] **Fase 4 - Módulo 2:** Noticias & Radar (Leaflet + OSM/CARTO + RainViewer, selector 7 días, pantalla completa).
- [x] **Fase 4 - Módulo 3:** Comunidad (50 foros provinciales, buscador de comarcas, máx 3 favoritas, 3 chats fijos con explicación de 1 línea, moderación).
- [x] **Fase 4 - Módulo 4:** Perfil, ubicación fija única, umbrales/tonos con preescucha y flujo inicial de acceso (Login / Registro / Invitado sin foros).
- [x] **Fase 5:** Integración transversal entre módulos, auditoría QA, build web verificada y documentación final.
