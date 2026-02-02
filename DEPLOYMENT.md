# Guía Completa de Despliegue: EduFinder CyL

Esta guía detalla los pasos para desplegar el frontend en **Vercel** y el backend y base de datos en **Render**.

## 1. Preparación del Código (Ya realizado)

He realizado las siguientes modificaciones automáticas para asegurar el éxito del despliegue:

- **Backend**:
  - Configurado `CORS` para permitir peticiones desde el frontend.
  - Asegurado que Laravel fuerce `HTTPS` en producción.
  - Preparado `config/database.php` para leer la variable `DATABASE_URL` de Render.
  - Creado un script `docker-start.sh` para ejecutar migraciones automáticamente al iniciar.
  - Actualizado el `Dockerfile`.
- **Frontend**:
  - Verificado la configuración de `axios` y variables de entorno.
  - Corregido `.gitignore` para incluir `tsconfig.json`.

**Paso Importante Antes de Empezar:**
Asegúrate de subir todos estos cambios a tu repositorio de GitHub:

```bash
git add .
git commit -m "Preparación para despliegue en Vercel y Render"
git push origin main
```

---

## 2. Despliegue del Backend (Render)

### Paso 2.1: Crear Base de Datos PostgreSQL

1. Ve a [dashboard.render.com](https://dashboard.render.com/).
2. Click en **New +** -> **PostgreSQL**.
3. **Name**: `edufinder-db` (o lo que prefieras).
4. **Region**: Frankfurt (EU Central) o la más cercana.
5. **Plan**: Free (para pruebas) o Starter.
6. Click **Create Database**.
7. Una vez creada, copia el **"Internal Database URL"** (se usará en el siguiente paso).

### Paso 2.2: Crear Web Service (Backend Laravel)

1. En el Dashboard de Render, click **New +** -> **Web Service**.
2. Conecta tu repositorio de GitHub.
3. **Name**: `edufinder-backend`.
4. **Region**: La misma que la base de datos.
5. **Branch**: `main`.
6. **Root Directory**: `backend` (Muy importante).
7. **Runtime**: **Docker**.
8. **Plan**: Free o Starter.
9. **Environment Variables** (Añade estas variables):
   - `APP_NAME`: `EduFinder`
   - `APP_ENV`: `production`
   - `APP_DEBUG`: `false`
   - `APP_KEY`: Copia tu clave local de `.env` (o genera una nueva con `php artisan key:generate --show`).
   - `LOG_CHANNEL`: `stderr`
   - `SESSION_DRIVER`: `cookie` (importante para contenedores)
   - `APP_URL`: La URL de tu backend en Render (https://edufinder-backend.onrender.com)
   - `FRONTEND_URL`: La URL de tu frontend en Vercel (https://edufinder-frontend.vercel.app)
   - `SANCTUM_STATEFUL_DOMAINS`: Tu dominio de Vercel (edufinder-frontend.vercel.app)
   - `FRONTEND_URL`: La URL de tu frontend en Vercel (https://edufinder-frontend.vercel.app)
   - `SANCTUM_STATEFUL_DOMAINS`: Tu dominio de Vercel (edufinder-frontend.vercel.app)
   - `DB_CONNECTION`: `pgsql`
   - `DATABASE_URL`: Pega el **Internal Database URL** que copiaste en el paso 2.1.

   **Variables para Emails (Gmail/SMTP):**
   - `MAIL_MAILER`: `smtp`
   - `MAIL_HOST`: `smtp.gmail.com`
   - `MAIL_PORT`: `587`
   - `MAIL_USERNAME`: tu@email.com
   - `MAIL_PASSWORD`: tu_contraseña_de_aplicación
   - `MAIL_ENCRYPTION`: `tls`
   - `MAIL_FROM_ADDRESS`: tu@email.com
   - `MAIL_FROM_NAME`: "EduFinder CyL"

   **Variables para Login Social (Google/GitHub):**
   - `GOOGLE_CLIENT_ID`: Tu Client ID de Google
   - `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google
   - `GOOGLE_REDIRECT`: `https://edufinder-backend.onrender.com/api/auth/google/callback` (¡Cambia esto en la consola de Google también!)
   - `GITHUB_CLIENT_ID`: Tu Client ID de GitHub
   - `GITHUB_CLIENT_SECRET`: Tu Client Secret de GitHub
   - `GITHUB_REDIRECT`: `https://edufinder-backend.onrender.com/auth/github/callback` (¡Cambia esto en la configuración de la App de GitHub!)

10. Click **Create Web Service**.

### Paso 2.3: Sincronización de Datos (Inicial)

Una vez desplegado el backend, necesitarás cargar los datos iniciales. Render ofrece una terminal ("Shell") en el dashboard de tu servicio.

1. Ve a la pestaña **Shell**.
2. Ejecuta el comando de sincronización:
   ```bash
   php artisan opendata:sync
   ```
   _Esto descargará y procesará los datos de la Junta de CyL. Puede tardar unos minutos._

El despliegue comenzará. Render construirá la imagen Docker, ejecutará las migraciones (gracias a `docker-start.sh`) y arrancará el servidor.
_Espera a que termine y aparezca "Live"._
**Copia la URL de tu backend** (ej: `https://edufinder-backend.onrender.com`).

---

## 3. Despliegue del Frontend (Vercel)

1. Ve a [vercel.com/new](https://vercel.com/new).
2. Importa tu repositorio de GitHub.
3. En **Project Name**: `edufinder-frontend`.
4. **Framework Preset**: Next.js (se detectará automáticamente).
5. **Root Directory**: Click en "Edit" y selecciona la carpeta `frontend`.
6. **Environment Variables**:
   Añade la siguiente variable para conectar con tu backend:
   - `NEXT_PUBLIC_API_URL`: `https://TU-BACKEND-EN-RENDER.onrender.com/api`
     _(Asegúrate de incluir `/api` al final)_.
7. Click **Deploy**.

Vercel construirá el frontend y lo publicará.

---

## 4. Verificación Final

1. Abre la URL que te da Vercel.
2. Navega por la aplicación.
3. Prueba el buscador y los mapas.
4. Si algo falla, revisa los logs:
   - **Frontend**: En el dashboard de Vercel -> Logs.
   - **Backend**: En el dashboard de Render -> Logs.

¡Listo! Tu aplicación debería estar 100% operativa en la nube.
