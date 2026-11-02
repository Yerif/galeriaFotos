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
- **Descarga**: proxy server-side (`/api/download/[photoId]`) que fuerza
  "Guardar como" con el nombre original y registra quién descargó qué.
- **Admin**: login simplificado — se ingresa el email y, si coincide con
  `ADMIN_EMAIL`, el servidor entrega una cookie firmada (HMAC con
  `ADMIN_SESSION_SECRET`, ver `lib/adminToken.ts`) que habilita `/admin/*`.
  No hay contraseña ni verificación por correo: es un candado simple
  pensado para una sola persona administradora en una galería privada,
  no para datos sensibles. Las operaciones de escritura (subir, borrar,
  cambiar el plazo) usan la service role key en el servidor, así que no
  dependen de Supabase Auth.
- **Plazo de 7 días**: un trigger de Postgres fija `event.deadline_at` a
  `now() + 7 días` cuando se sube la primera foto. El servidor deja de
  emitir signed URLs y de aceptar descargas pasada esa fecha — no hace
  falta ningún cron job.
- **Free tier**: las fotos se comprimen/redimensionan en el navegador antes
  de subirse (variantes `display` ~1600px y `thumb` ~500px), evitando
  depender de Supabase Image Transformations (función de pago) y
  manteniendo el consumo de Storage/egress muy por debajo de los límites
  gratuitos de Supabase y Vercel.
- **Decoración**: fondo con Three.js (pocas partículas, dpr limitado, se
  pausa fuera de pantalla) con fallback automático a CSS si el dispositivo
  no soporta WebGL o el usuario activó "reducir movimiento".
