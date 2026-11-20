# Curly Tracker

PWA monocromática para el control capilar masculino: perfil de rizo, inventario inteligente y una rutina semanal que se adapta a lo que realmente tienes.

## Qué incluye

- **Estética**: Tailwind CSS vía CDN, fuente `Outfit` (Google Fonts) y paleta estrictamente monocromática (`#09090b`, `#121214`, `#27272a`, `#a1a1aa`, `#fafafa`). Desplegables personalizados con menú propio (teclado incluido) para perfil, categorías, estado, **hora del recordatorio y fecha del registro**; navegación inferior flotante en móvil y barra lateral en escritorio.
- **PWA**: `manifest.json` con `display: standalone`, tema `#09090b` e ícono SVG minimalista; `sw.js` con caché offline básica, recordatorios y manejo de `push`/`notificationclick`.
- **Notificaciones**: permiso con `Notification.requestPermission()`, hora configurable, aviso diario basado en el plan del día y notificación de prueba.
- **Autenticación**: Google OAuth y email/contraseña con Supabase (`@supabase/supabase-js` vía CDN).
- **Sincronización**: `user_profile`, `products`, `tools` y `schedule_logs` con RLS por `auth.uid()`. Si las tablas aún no existen o no hay sesión, la app sigue funcionando en **modo local** (localStorage).
- **Módulos**:
  1. Perfil capilar (patrón 2C–4A, porosidad, grosor y objetivo).
  2. Inventario de 6 categorías de productos con estados, etiquetas de componentes e indicador de compatibilidad; 9 herramientas esenciales precargadas más herramientas personalizadas.
  3. Horario semanal calculado a partir del perfil y del inventario disponible, con sugerencias discretas de productos faltantes, registro diario y puntuación de definición/frizz (1–5).

## Puesta en marcha (Live Server)

1. Abre esta carpeta en VS Code.
2. Inicia **Live Server** sobre `index.html` (o sirve la carpeta con cualquier servidor estático).
3. Pulsa **Continuar sin cuenta (modo local)** para probar sin backend, o usa Google / email para sincronizar.

> Los Service Workers requieren `http://localhost` o HTTPS. `file://` no los registra.

## Configurar Supabase

1. Entra en [Supabase](https://supabase.com/) y abre el proyecto.
2. Ve a **SQL Editor → New query**, pega todo `schema.sql` y pulsa **Run**.
3. Activa Google en **Authentication → Providers → Google** y añade como *Redirect URL* la URL de tu despliegue (y `http://localhost:5500` para Live Server; ajusta el puerto al de tu servidor).
4. En **Authentication → URL Configuration**, añade la misma URL a *Site URL* y *Redirect URLs*.
5. Recarga la app e inicia sesión. Los datos locales se suben automáticamente en la primera sincronización.

Las credenciales (URL y clave publishable) ya están configuradas en `app.js`. Son públicas por diseño; la seguridad de los datos la garantizan las políticas RLS de `schema.sql`.

### Notas sobre notificaciones

- El aviso diario se genera localmente: la pestaña comprueba la hora cada 30 segundos y el Service Worker mantiene un temporizador auxiliar mientras siga activo.
- El evento `push` del Service Worker está preparado; para push remoto real hace falta un servidor con clave VAPID y un endpoint que envíe mensajes. No es necesario para el recordatorio local.

## Despliegue en Vercel

Opción A — desde la interfaz:

1. Crea un repositorio Git con esta carpeta y súbelo a GitHub.
2. En Vercel → **Add New → Project**, selecciona el repositorio.
3. **Framework Preset**: *Other*. **Root Directory**: `curly-tracker` (si el repo contiene más carpetas).
4. **Build Command** y **Output Directory**: déjalos vacíos (o usa `.` como Output Directory).
5. Deploy. Añade la URL resultante a las Redirect URLs de Supabase.

Opción B — CLI:

```bash
cd curly-tracker
vercel
```

No hay variables de entorno obligatorias: el proyecto es estático y las credenciales de Supabase son la clave publishable incluida en el cliente.

## Estructura

```
curly-tracker/
├── index.html      # Interfaz, layouts y estilos
├── app.js          # Estado, Supabase, compatibilidad, horario y notificaciones
├── manifest.json   # Metadata PWA
├── sw.js           # Service Worker (offline + notificaciones)
├── icon.svg        # Ícono monocromático (fuente)
├── icon-192.png    # Ícono PWA 192 px
├── icon-512.png    # Ícono PWA 512 px
├── schema.sql      # Tablas + RLS
├── .gitignore
└── README.md
```

## Uso rápido

- Toca el estado de un producto para ciclar entre *En uso → Por acabarse → No lo tengo*.
- Marca herramientas para que pasen a formar parte de los pasos de la rutina.
- El horario nunca incluye productos que no tienes; cuando falta algo relevante aparece una sugerencia discreta.
- En **Hoy** puedes registrar el día directamente; en **Rutina** puedes registrar cualquier día de la semana.
- En **Ajustes** puedes exportar un JSON, borrar datos locales o forzar la sincronización.
