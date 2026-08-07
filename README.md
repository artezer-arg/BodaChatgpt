# Invitación Digital de Casamiento — Pamela & Nestor

Invitación digital premium, responsiva, con diseño botánico en acuarela, integrada con Supabase para almacenamiento de datos (RSVPs, sugerencias de canciones, fotos de invitados) y un panel privado de administración.

## Características

- **Diseño Premium Fiel**: Composición botánica clásica, tonos verdes salvia y oliva, tipografía manuscrita fluida y serif editorial elegante.
- **Invitación Interactiva**:
  - Cuenta regresiva dinámica calculada en base a la fecha de la boda (Zona horaria de Argentina).
  - Integración de ubicación con Google Maps.
  - Copiado rápido al portapapeles del Alias bancario con notificaciones Toast.
  - Formulario de confirmación de asistencia (RSVP) con validación de duplicados (por DNI) y campos condicionales.
  - Formulario para sugerencia de canciones para la fiesta.
  - Carga múltiple de fotografías tomadas por los invitados (JPG, PNG, HEIC) con barra de progreso directamente a Supabase Storage.
  - Enlace a perfil de Instagram de los novios.
  - Botón flotante para activar o pausar la música de fondo.
- **Panel de Administración Privado (`/admin`)**:
  - Protegido por inicio de sesión (Supabase Auth).
  - Formulario de edición de configuraciones de la boda en tiempo real (nombres, fecha, hora, alias, canción, etc.).
  - Visor y gestión de RSVPs con filtros, buscador y exportación a CSV optimizada para Excel (UTF-8 BOM).
  - Visor y moderación de sugerencias de música.
  - Galería de aprobación de fotos de invitados (aprobar para habilitar o eliminar permanentemente del servidor).

---

## Requisitos Previos

- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- Una cuenta gratuita de **Supabase**

---

## Configuración de la Base de Datos (Supabase)

1. Creá un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ir a la sección **SQL Editor** en tu panel de Supabase y creá una consulta nueva.
3. Copiá el contenido del archivo [`schema.sql`](file:///schema.sql) y ejecutalo. Esto creará:
   - Las tablas `settings`, `rsvps`, `suggested_songs` y `photos`.
   - La fila por defecto de configuración inicial.
   - Las políticas de seguridad Row Level Security (RLS).
4. Creá dos buckets de almacenamiento públicos en la sección **Storage** de Supabase:
   - Nombre: `photos` (para que los invitados suban imágenes).
   - Nombre: `music` (para almacenar el audio de fondo).
5. Asegúrate de configurar las políticas de Storage para que:
   - Los usuarios públicos puedan insertar y leer archivos en `photos`.
   - Los administradores autenticados puedan borrar y listar en `photos` e interactuar libremente en `music`.

---

## Configuración del Entorno Local

1. Cloná o extraé el proyecto en tu máquina local.
2. Duplicá el archivo `.env.example` y renombralo a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Completá las variables con tus credenciales de Supabase (las podés encontrar en *Project Settings > API*):
   - `VITE_SUPABASE_URL`: La URL del proyecto.
   - `VITE_SUPABASE_ANON_KEY`: La clave anónima pública API (*anon public*).

4. Instalá las dependencias del proyecto:
   ```bash
   npm install
   ```

5. Iniciá el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

---

## Creación de Usuario Administrador

Para poder acceder a `/admin`, necesitas crear un usuario de autenticación en Supabase:
1. En el panel de Supabase, ve a la sección **Authentication > Users**.
2. Hacé clic en **Add User > Create User**.
3. Ingresá el correo electrónico y contraseña del administrador.
4. Desactivá la opción "Auto-confirm User" o confirmá el correo directamente desde el panel para que el usuario quede activo de inmediato.

---

## Despliegue en Vercel

Vercel es la plataforma ideal y recomendada para publicar esta invitación de forma gratuita y en minutos.

1. **Subí el código a un repositorio**: Creá un repositorio privado o público en GitHub, GitLab o Bitbucket y subí los archivos del proyecto.
2. **Importá a Vercel**:
   - Iniciá sesión en [Vercel](https://vercel.com/).
   - Hacé clic en **Add New > Project**.
   - Seleccioná e importá tu repositorio de la boda.
3. **Configurá las Variables de Entorno**:
   - En el paso de configuración de Vercel, desplegá la pestaña **Environment Variables**.
   - Agregá las dos claves que utilizás en tu archivo `.env`:
     - Nombre: `VITE_SUPABASE_URL` | Valor: *[Tu URL de Supabase]*
     - Nombre: `VITE_SUPABASE_ANON_KEY` | Valor: *[Tu anon key]*
4. **Desplegá**:
   - Hacé clic en el botón **Deploy**.
   - Vercel compilará la aplicación y en menos de un minuto te proveerá un enlace público (`https://tu-proyecto.vercel.app`) listo para enviar a tus invitados.
