<div align="center">

<img src="./icon.svg" width="76" alt="Ícono de Curly Tracker" />

# Curly Tracker

**Tu rizo, tu inventario y tu rutina. En una sola app.**

[ Abrir la app ](https://curly-tracker.vercel.app) · [ Ver el código ](https://github.com/JSebasDazaC/curly-tracker) · [ Enviar una sugerencia ](#buzón)

</div>

---

## En corto

Curly Tracker es una **PWA en español** pensada para cuidar el cabello rizado sin hojas de cálculo ni apps de pago.

- Funciona **sin cuenta**, con **Google** o con un **código de 6 dígitos** por correo.
- Guarda tus datos en el dispositivo y, si inicias sesión, los sincroniza sola.
- Planea tu rutina con base en **lo que realmente tienes** en el inventario.
- Es monocromática, instalable y usable offline.
- No tiene anuncios, rastreadores ni proveedores de pago.

---

## Cómo se usa

| Vista | Para qué sirve |
| --- | --- |
| **Hoy** | Tu plan del día, tu racha, las sugerencias y el registro de lo que hiciste. |
| **Rutina** | Los otros seis días. El de hoy solo es un atajo a *Hoy*, para no repetir información. |
| **Inventario** | Tus productos organizados por categoría, con estados, compatibilidad, kits y lista de compras en una sola barra. |
| **Mi perfil** | Tu identidad social, tu perfil capilar y el estado de tu cuenta. |
| **Ajustes** | Recordatorio diario, buzón de sugerencias, exportación y borrado de datos. |

> Cada dato vive en un solo lugar. Si hoy cambias un producto, la rutina y el inventario lo ven al instante.

---

## Lo que puedes hacer

### Tu perfil

- Editar **nombre, apellido, usuario, nombre a mostrar y biografía** haciendo clic directamente sobre el texto.
- Pasar el cursor para ver un borde suave; hacer clic para escribir; **Enter guarda** y **Esc cancela**.
- Cambiar foto y banner desde su lápiz, con opciones de *Cambiar* y *Quitar*.
- Ver el usuario junto al nombre, en gris y más pequeño, sin etiquetas extras.
- Pegar texto decorativo en el nombre a mostrar: tipografías, emojis y símbolos de otras páginas.

### Tu inventario

- Seis categorías con su propio ícono y scroll horizontal.
- Un filtro compacto **Ver → Todos / Lista de compra**, sin barras apiladas.
- Cambiar estados con un selector: *En uso → Por acabarse → No lo tengo*.
- Marcar herramientas para que aparezcan en los pasos de la rutina.
- El horario nunca te pide productos que no tienes; cuando falta algo, lo sugiere de forma discreta.

### Tu rutina

- Ver el plan de cada día y registrar lo que funcionó.
- Recibir un recordatorio diario a la hora que elijas, en formato de 12 horas.
- Tener el día de hoy siempre primero y accesible desde un solo toque.

### Tus datos

- Empezar en **modo local** y decidir después si quieres cuenta.
- Iniciar sesión con Google o con un código enviado a tu correo, sin contraseñas.
- Sincronizar automáticamente entre dispositivos cuando hay sesión.
- Exportar un JSON o borrar tus datos cuando quieras.

---

## Cuentas

Tres formas de entrar, sin obligarte a usar ninguna:

| Modo | Qué necesitas | Qué guarda |
| --- | --- | --- |
| **Continuar sin cuenta** | Nada | Todo en este dispositivo. |
| **Google** | Tu cuenta de Google | Copia en la nube y sincronización. |
| **Correo** | Tu correo y un código de 6 dígitos | Copia en la nube y sincronización. |

En **Mi perfil → Cuenta** puedes ver los accesos vinculados, cerrar sesión o volver al modo local. Si una escritura falla, la app sigue mostrando la cuenta y reintenta sola; mientras tanto verás **Sin sincronizar**.

---

## Detalles que importan

- **Edición sin saltos**: la caja del editor es la misma que la del texto en lectura. Crece mientras escribes y no se mueve al hacer clic.
- **Placeholders genéricos**: `tu.usuario`, `Tu nombre`, `Añade tu apellido`, `nombre@dominio.com`. Nunca usamos tu nombre, correo ni usuario real como texto de ayuda.
- **Interfaz local**: Tailwind y Supabase se sirven desde el proyecto, así que un bloqueo de CDNs no rompe el diseño.
- **Notificaciones**: permiso bajo demanda, hora configurable y aviso diario generado en la propia app. El push remoto real requeriría un servidor con VAPID.
- **Offline**: el Service Worker mantiene la interfaz y los datos disponibles cuando no hay red.
- **Instalación**: manifiesto con `display: standalone` e ícono monocromático. Si ya tenías la PWA abierta, ciérrala y ábrela una vez tras cada actualización.

---

## Buzón

¿Encontraste un error o tienes una idea?

Ve a **Ajustes → Buzón de sugerencias y errores**. Cualquier visitante puede escribir, sin necesidad de iniciar sesión.

El formulario envía el mensaje desde la propia app con **FormSubmit.co**. La primera vez, el servicio pide una confirmación al destinatario; después los mensajes llegan normalmente.

---

<details>
<summary><strong>Ver en local</strong></summary>

1. Abre esta carpeta en VS Code.
2. Inicia **Live Server** sobre `index.html`, o sirve la carpeta con cualquier servidor estático.
3. Entra con *Continuar sin cuenta*, con Google o con tu correo.

> Los Service Workers necesitan `http://localhost` o HTTPS. Con `file://` no se registran.

</details>

<details>
<summary><strong>Configuración de Supabase</strong></summary>

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta el contenido de `schema.sql` en el editor de consultas. Es idempotente: crea o ajusta tablas, perfil social, índice único de usuario, políticas RLS, Realtime y el bucket de imágenes.
3. Activa **Google** en *Authentication → Providers* y añade la URL de la app a las URLs permitidas.
4. Activa **Email OTP** con una plantilla que incluya `{{ .Token }}` y longitud de código `6`.
5. Activa **Enable Manual Linking** si quieres vincular/desvincular Google desde el perfil.
6. Recarga la app. Los datos locales se suben automáticamente al iniciar sesión.

La URL y la clave publishable ya están incluidas en `app.js`. Son públicas por diseño; la protección la dan las políticas de acceso.

</details>

<details>
<summary><strong>Despliegue</strong></summary>

El proyecto es estático: no hay variables de entorno obligatorias ni comandos de build.

- En Vercel, usa **Framework Preset: Other**, **Root Directory: curly-tracker**, y deja build/output vacíos.
- Por CLI: `cd curly-tracker && vercel`.
- Si Vercel rechaza el deploy por el autor del commit local, copia la carpeta a una temporal **sin `.git`**, conserva `.vercel/project.json` y ejecuta allí `npx vercel deploy --prod --yes --archive=tgz`.
- Tras cada deploy, cierra y abre la PWA una vez para descargar la versión nueva.

</details>

<details>
<summary><strong>Estructura del proyecto</strong></summary>

```text
curly-tracker/
├── index.html      # Interfaz, estilos y layouts
├── app.js          # Estado, vistas, auth, perfil, rutina y sincronización
├── tailwind.css    # Utilidades generadas, servidas localmente
├── supabase.js     # Cliente Supabase, servido localmente
├── manifest.json   # Metadatos de la PWA
├── sw.js           # Caché offline y notificaciones
├── icon.svg        # Ícono base, monocromático
├── icon-192.png    # Ícono PWA 192 px
├── icon-512.png    # Ícono PWA 512 px
├── schema.sql      # Estructura de datos, acceso y almacenamiento
└── README.md       # Este documento
```

</details>

---

<div align="center">

Hecho para que cuidar tu rizo sea simple, privado y tuyo.

**[ Abrir Curly Tracker ](https://curly-tracker.vercel.app)**

</div>
