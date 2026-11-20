# Curly Tracker

PWA monocromática para el control capilar masculino: perfil de rizo, inventario inteligente y una rutina semanal que se adapta a lo que realmente tienes.

## Qué incluye

- **Estética**: Tailwind CSS vía CDN, fuente `Outfit` (Google Fonts) y paleta estrictamente monocromática (`#09090b`, `#121214`, `#27272a`, `#a1a1aa`, `#fafafa`). Desplegables personalizados con menú propio (teclado incluido) para perfil, categorías, estado, **hora del recordatorio y fecha del registro**; navegación inferior flotante en móvil y barra lateral en escritorio.
- **PWA**: `manifest.json` con `display: standalone`, tema `#09090b` e ícono SVG minimalista; `sw.js` con caché offline básica, recordatorios y manejo de `push`/`notificationclick`.
- **Notificaciones**: permiso con `Notification.requestPermission()`, hora configurable, aviso diario basado en el plan del día y notificación de prueba.
- **Autenticación**: Google, Microsoft (Azure) y Facebook OAuth; acceso sin contraseña con **un solo campo de correo** que envía un enlace; sesión local sin cuenta. Todo con Supabase (`@supabase/supabase-js` vía CDN). El registro pide los datos de perfil después de abrir el enlace. Si falla o caduca, se muestra una pantalla limpia en español para solicitar otro.
- **Perfil social**: nombre, apellido, **usuario único**, nombre a mostrar independiente, estilo de tipografía, biografía, foto de perfil y banner. El usuario se valida en tiempo real y se protege con un índice único en minúsculas.
- **Sincronización**: `user_profile`, `products`, `tools` y `schedule_logs` con RLS por `auth.uid()`. Los cambios hechos en cualquier dispositivo se suben y se reciben en los demás mediante **Supabase Realtime**; al volver del segundo plano también se refresca automáticamente. Las imágenes se guardan en el bucket público `avatars` de Supabase Storage. Si las tablas aún no existen o no hay sesión, la app sigue funcionando en **modo local** (localStorage).
- **Módulos**:
  1. Perfil social y capilar (identidad personalizable + patrón 2C–4A, porosidad, grosor y objetivo).
  2. Inventario de 6 categorías de productos con estados, etiquetas de componentes e indicador de compatibilidad; 9 herramientas esenciales precargadas más herramientas personalizadas.
  3. Horario semanal calculado a partir del perfil y del inventario disponible, con sugerencias discretas de productos faltantes, registro diario y puntuación de definición/frizz (1–5).

## Puesta en marcha (Live Server)

1. Abre esta carpeta en VS Code.
2. Inicia **Live Server** sobre `index.html` (o sirve la carpeta con cualquier servidor estático).
3. Pulsa **Continuar sin cuenta** para probar sin backend, o entra con Google, Microsoft, Facebook, o escribe tu correo y abre el enlace recibido.

> Los Service Workers requieren `http://localhost` o HTTPS. `file://` no los registra.

## Configurar Supabase

1. Entra en [Supabase](https://supabase.com/) y abre el proyecto.
2. Ve a **SQL Editor → New query**, pega todo `schema.sql` y pulsa **Run**. Es idempotente: crea/actualiza las columnas del perfil social, el índice único de usuario, la función `username_available`, las cuatro tablas, RLS, su inclusión en `supabase_realtime` y el bucket `avatars` con sus políticas de Storage.
3. Activa los proveedores que quieras usar en **Authentication → Providers**: **Google**, **Azure** (se muestra como Microsoft en la app) y **Facebook**. Cada uno necesita su propio Client ID/Secret y la *Redirect URL* de Supabase.
4. Activa el envío de correo (**Magic Link / Email OTP**) en **Authentication → Providers → Email**. La app envía un enlace de verificación con un botón; al pulsarlo se activa la cuenta. Asegúrate de que la plantilla de correo no mencione códigos de terceros: el mensaje que muestra la app es «Te enviamos un enlace de verificación a tu correo. Haz clic en el botón del mensaje para activar tu cuenta».
5. En **Authentication → URL Configuration**, añade la URL de tu despliegue (y `http://localhost:5500` para Live Server; ajusta el puerto) a *Site URL* y *Redirect URLs*.
6. Recarga la app e inicia sesión. En **Crear cuenta** verás el campo de correo y, tras abrir el enlace, se abrirá el formulario con usuario, nombre a mostrar, estilo y biografía. Después podrás editar todo desde **Mi perfil**. Los datos locales se suben automáticamente.
7. Si ya tenías la PWA instalada, ciérrala y ábrela de nuevo para que descargue la versión nueva (el Service Worker se actualiza solo).

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

> Si Vercel bloquea el deploy con *“The commit author doesn't have access to this team”*, copia el proyecto a una carpeta temporal **sin `.git`** pero conservando `.vercel/project.json`, y ejecuta allí `vercel deploy --prod --yes --archive=tgz`. Así no se envía la metadata del commit local.

No hay variables de entorno obligatorias: el proyecto es estático y las credenciales de Supabase son la clave publishable incluida en el cliente.

## Estructura

```
curly-tracker/
├── index.html      # Interfaz, layouts y estilos
├── app.js          # Estado, autenticación, perfil social, Supabase, horario y notificaciones
├── manifest.json   # Metadata PWA
├── sw.js           # Service Worker (offline + notificaciones)
├── icon.svg        # Ícono monocromático (fuente)
├── icon-192.png    # Ícono PWA 192 px
├── icon-512.png    # Ícono PWA 512 px
├── schema.sql      # Tablas, perfil social, Storage + RLS + Realtime
├── .gitignore
└── README.md
```

## Uso rápido

- En **Mi perfil** personaliza usuario, nombre a mostrar, tipografía, biografía, foto y banner; el cambio se sincroniza solo.
- Toca el estado de un producto para ciclar entre *En uso → Por acabarse → No lo tengo*.
- Marca herramientas para que pasen a formar parte de los pasos de la rutina.
- El horario nunca incluye productos que no tienes; cuando falta algo relevante aparece una sugerencia discreta.
- En **Hoy** puedes registrar el día directamente; en **Rutina** puedes registrar cualquier día de la semana.
- En **Ajustes** puedes exportar un JSON, borrar datos locales o forzar la sincronización.
