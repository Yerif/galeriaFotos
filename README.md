# Galería de fotos — Fiesta de Halloween 🎃

Galería de fotos para la fiesta de Halloween: el admin sube las fotos desde un
dashboard mobile-first y ve quién descargó cada una; los invitados entran sin
login a un link único, se identifican solo con su nombre y descargan sus fotos.
Las descargas quedan disponibles 7 días desde que se sube la primera foto.

Stack: Next.js (App Router) + Supabase (Postgres, Storage, Auth), pensado para
quedarse dentro del free tier de Vercel y Supabase (ver el plan en
`/root/.claude/plans/quiero-hacer-una-galeria-shiny-owl.md` si sigue disponible,
o la sección de arquitectura más abajo).

## Setup

1. Crear un proyecto en [Supabase](https://supabase.com).
2. Abrir el SQL editor del proyecto y correr `supabase/migrations/0001_init.sql`,
   reemplazando `ADMIN_EMAIL_PLACEHOLDER` por tu email de administrador en las
   4 ocurrencias del archivo.
3. Copiar `.env.local.example` a `.env.local` y completar:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → Data API → Project URL, **sin** `/rest/v1/` al final).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → Data API → `anon`/`publishable` key).
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → Data API → `service_role`/`secret` key — **nunca** se expone al cliente).
   - `ADMIN_EMAIL` con el mismo email que usaste en el paso 2.
   - `ADMIN_SESSION_SECRET`: cualquier cadena larga y aleatoria, por ejemplo generada con `openssl rand -hex 32`.
4. Instalar dependencias y correr en local:

   ```bash
   npm install
   npm run dev
   ```

5. Abrir `http://localhost:3000` (redirige a `/galeria`, la vista de invitados)
   y `http://localhost:3000/admin/login` para entrar como administrador.

## Deploy en Vercel

1. Conectar el repo en [Vercel](https://vercel.com/new).
2. Agregar las mismas 5 variables de entorno del paso 3 anterior en
   Project Settings → Environment Variables, y hacer un deploy nuevo
   (agregar variables no redeploya solo).
3. Deploy. El link `/galeria` es el que se comparte con los invitados.

## Arquitectura (resumen)

- **Invitados**: sin autenticación. Se les pide el nombre una sola vez
  (guardado en `localStorage`) antes de ver la galería. El grid usa lazy
  loading + paginado, y el lightbox (swipe en mobile) carga la foto en
  tamaño completo solo al abrirla.
- **Imágenes**: se sirven desde el mismo origen por `/api/photos/[id]/img`
  (`?v=thumb|display`) con `Cache-Control` acotado al plazo de descarga
  (máx. 24 h y nunca más allá del vencimiento). El navegador y el CDN de
  Vercel las cachean: ~1 descarga de Supabase por foto en vez de una por
  invitado. Una foto borrada por el admin puede seguir visible en caché
  hasta 24 h.
- **Descarga**: en móviles con Web Share de archivos se abre la hoja de
  compartir para guardar directo en Fotos (`lib/shareOrDownload.ts`); si no
  hay soporte, o iOS la bloquea, se usa `/api/download/[photoId]` (descarga
  de archivo). Cada descarga queda registrada por nombre: la de archivo la
  registra el servidor y la de compartir, `POST /api/downloads`, solo si
  el usuario completó la acción (cancelar no cuenta).
- **Admin**: login simplificado — se ingresa el email y, si coincide con
  `ADMIN_EMAIL`, el servidor entrega una cookie firmada (HMAC con
  `ADMIN_SESSION_SECRET`, ver `lib/adminToken.ts`) que habilita `/admin/*`.
  No hay contraseña ni verificación por correo: es un candado simple
  pensado para una sola persona administradora en una galería privada,
  no para datos sensibles. Las operaciones de escritura (subir, borrar,
  cambiar el plazo) usan la service role key en el servidor, así que no
  dependen de Supabase Auth.
- **Plazo de 7 días**: un trigger de Postgres fija `event.deadline_at` a
  `now() + 7 días` cuando se sube la primera foto. Pasada esa fecha
  el servidor responde 403 en las imágenes y rechaza descargas, y las
  copias en caché caducan a más tardar en el vencimiento — no hace falta
  ningún cron job. El contador de la cabecera muestra los días y, en las
  últimas 24 h, un reloj HH:MM:SS.
- **Free tier**: las fotos se comprimen/redimensionan en el navegador antes
  de subirse (variantes `display` ~1600px y `thumb` ~500px), evitando
  depender de Supabase Image Transformations (función de pago) y
  manteniendo el consumo de Storage/egress muy por debajo de los límites
  gratuitos de Supabase y Vercel.
- **Experiencia visual**: intro tipo título de película (solo CSS, una vez por
  sesión, saltable), grilla justificada sin recortes, lightbox con zoom y
  cierre deslizando, y niebla de proyector en la cabecera. Solo se animan
  `transform` y `opacity`, y `prefers-reduced-motion` apaga todo el movimiento.
- **Niebla WebGL (Three.js)**: la niebla CSS siempre está; la de WebGL entra
  encima solo en dispositivos que pasan una compuerta (`lib/webglCapability.ts`:
  ≥4 núcleos, sin ahorro de datos, red 4g, WebGL2, sin reduce-motion), tras
  `requestIdleCallback` y renderizada a 0.5 de resolución. Una guardia
  (`lib/frameGuard.ts`) la apaga si la mediana de fotogramas supera 24 ms.
  El chunk de Three.js pesa ~240 KB gzip: si en la práctica no compensa,
  se puede quitar `FogBackground` de `GalleryHeader` y la niebla CSS queda sola.
- **Modo demo** (`DEMO_MODE=1`, opcional `DEMO_COUNT`, `DEMO_DEADLINE_HOURS`):
  datos de muestra sin Supabase, para previsualizar y medir.
