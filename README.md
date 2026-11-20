# Curly Tracker

PWA monocromática para el control capilar masculino: perfil de rizo, inventario inteligente y una rutina semanal que se adapta a lo que realmente tienes.

## Qué incluye

- **Estética**: Tailwind CSS generado y servido localmente (`tailwind.css`, sin dependencia de CDN), fuente `Outfit` (Google Fonts) y paleta estrictamente monocromática (`#09090b`, `#121214`, `#27272a`, `#a1a1aa`, `#fafafa`). Desplegables personalizados con menú propio (teclado incluido) para perfil, categorías, estado, **hora del recordatorio y fecha del registro**; navegación inferior flotante en móvil y barra lateral en escritorio.
- **PWA**: `manifest.json` con `display: standalone`, tema `#09090b` e ícono SVG minimalista; `sw.js` con caché offline básica, recordatorios y manejo de `push`/`notificationclick`.
- **Notificaciones**: permiso con `Notification.requestPermission()`, hora configurable en formato de 12 horas (AM/PM), aviso diario basado en el plan del día y notificación de prueba.
- **Autenticación**: Google, Microsoft (Azure) y Facebook OAuth; acceso sin contraseña con **un solo campo de correo** que envía un código de 6 dígitos; sesión local sin cuenta. Todo con Supabase (`@supabase/supabase-js` servido localmente como `supabase.js`). El código se introduce en la propia app, sin depender de que el correo abra la PWA. En **Mi perfil → Cuenta** se ven los accesos vinculados en filas con **Vincular/Desvincular**; se añaden con `linkIdentity()` y se quitan con `unlinkIdentity()` (requiere activar *Enable Manual Linking* en Supabase y conservar al menos un acceso). El registro pide los datos de perfil después de verificarlo. Si falla o caduca, se muestra una pantalla limpia en español para solicitar otro.
- **Perfil social**: nombre, apellido, **usuario único**, nombre a mostrar independiente (acepta texto decorativo, tipografías, emojis y símbolos pegados desde otras páginas), biografía, foto de perfil y banner. **Edición in situ**: al pasar el cursor sobre el nombre, el usuario, la biografía o los datos capilares aparece un borde suave y semitransparente como el del editor, sin iconos de más; al hacer clic se convierte en un input sin fondo, con un borde completo y un ancho que se ajusta a lo escrito desde un mínimo, y Enter o ✓ guarda (Esc o ✕ cancela). Las fotos también se editan desde su lápiz con *Cambiar/Quitar*. La foto y el banner se actualizan a la vez en la tarjeta y los avatares de la navegación; las URLs se escapan correctamente y no se recortan. Los placeholders son genéricos y nunca muestran datos del desarrollador. El usuario se valida al guardar y se protege con un índice único en minúsculas. En escritorio, la tarjeta social con el perfil capilar y la tarjeta Cuenta se organizan en dos columnas proporcionalmente a su contenido.
- **Sincronización**: `user_profile`, `products`, `tools` y `schedule_logs` con RLS por `auth.uid()`. Los cambios hechos en cualquier dispositivo se suben y se reciben en los demás mediante **Supabase Realtime**; al volver del segundo plano también se refresca automáticamente. Las imágenes se guardan en el bucket público `avatars` de Supabase Storage. Solo se muestra **modo local** cuando no hay sesión; si hay sesión pero falla una lectura/escritura, la cuenta sigue apareciendo conectada con el aviso **Sin sincronizar** y la app reintenta sola cada 8 segundos y al volver al frente. Los datos siempre se conservan en localStorage.

> Tailwind y Supabase se sirven desde el propio proyecto para que un bloqueo de CDNs externos (adblock, red corporativa, filtros del navegador, etc.) no deje la interfaz sin layout ni la app sin cliente de datos.

- **Vistas, cada dato en una sola casa**:
  1. **Hoy**: plan del día, racha, sugerencias, resultado y registro del día.
  2. **Rutina**: los otros seis días; el día de hoy solo es un acceso a Hoy, sin repetir pasos ni registro. Hoy va primero en la fila y en la lista para no tener que desplazarse a encontrarlo.
  3. **Inventario**: resumen visual de lo disponible, 6 categorías con ícono propio, estados con selector giratorio, filtro *Lista de compra*, compatibilidad y kits con interruptor.
  4. **Mi perfil**: identidad social, perfil capilar, cuenta/sesión y accesos vinculados.
  5. **Ajustes**: recordatorio diario, **buzón de sugerencias y reporte de errores** (abierto a cualquier visitante, se envía a `sebastiandaza0209@gmail.com` mediante FormSubmit.co) y datos (exportar/borrar).

## Puesta en marcha (Live Server)

1. Abre esta carpeta en VS Code.
2. Inicia **Live Server** sobre `index.html` (o sirve la carpeta con cualquier servidor estático).
3. Pulsa **Continuar sin cuenta** para probar sin backend, o entra con Google, Microsoft, Facebook, o escribe tu correo e introduce el código de 6 dígitos recibido.

> Los Service Workers requieren `http://localhost` o HTTPS. `file://` no los registra.

## Buzón de contacto

El formulario de **Ajustes → Buzón de sugerencias y errores** usa `https://formsubmit.co/ajax/sebastiandaza0209@gmail.com`. La primera vez que se envíe un mensaje, FormSubmit mandará un correo de confirmación a esa dirección: hay que confirmarlo para activar el buzón. Después, todos los mensajes llegan normalmente.

## Configurar Supabase

1. Entra en [Supabase](https://supabase.com/) y abre el proyecto.
2. Ve a **SQL Editor → New query**, pega todo `schema.sql` y pulsa **Run**. Es idempotente: crea/actualiza las columnas del perfil social, el índice único de usuario, la función `username_available`, las cuatro tablas, RLS, su inclusión en `supabase_realtime` y el bucket `avatars` con sus políticas de Storage.
3. Activa los proveedores que quieras usar en **Authentication → Providers**: **Google**, **Azure** (se muestra como Microsoft en la app) y **Facebook**. Cada uno necesita su propio Client ID/Secret y la *Redirect URL* de Supabase. Activa también **Enable Manual Linking** en la configuración de Authentication para poder vincular accesos desde el perfil.
4. Activa el envío de correo (**Email OTP**) en **Authentication → Providers → Email** y usa una plantilla que incluya `{{ .Token }}` (por ejemplo: `Tu código de Curly Tracker es {{ .Token }}`). La app envía ese código y lo verifica dentro de la PWA con `verifyOtp({ email, token, type: 'email' })`, así que no hace falta abrir ningún enlace. Si la plantilla sigue enviando solo `{{ .ConfirmationURL }}`, el enlace antiguo también sigue funcionando como respaldo. Ajusta **Authentication → Sign In / Providers → Email → OTP Settings → OTP Length = 6** para que coincida con las 6 casillas de la app.
5. En **Authentication → URL Configuration**, añade la URL de tu despliegue (y `http://localhost:5500` para Live Server; ajusta el puerto) a *Site URL* y *Redirect URLs*.
6. Recarga la app e inicia sesión. En **Crear cuenta** verás el campo de correo y, tras introducir el código, se abrirá el formulario con usuario, nombre a mostrar y biografía. Después podrás editar todo desde **Mi perfil**. Los datos locales se suben automáticamente.
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
├── tailwind.css    # Utilidades Tailwind generadas y servidas localmente
├── supabase.js     # Cliente Supabase UMD servido localmente
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

- En **Mi perfil** personaliza usuario, nombre a mostrar (con el texto decorativo que quieras pegar), biografía, foto y banner; el cambio se sincroniza solo.
- Toca el estado de un producto para ciclar entre *En uso → Por acabarse → No lo tengo*.
- Marca herramientas para que pasen a formar parte de los pasos de la rutina.
- El horario nunca incluye productos que no tienes; cuando falta algo relevante aparece una sugerencia discreta.
- En **Hoy** registras el día; en **Rutina**, el acceso de hoy te lleva allí y los otros seis días tienen su propio registro.
- En **Mi perfil → Cuenta** ves el estado de la sincronización, cierras sesión o vuelves al acceso con código.
- En **Ajustes** puedes exportar un JSON o borrar tus datos (también la copia de la cuenta si has iniciado sesión).
