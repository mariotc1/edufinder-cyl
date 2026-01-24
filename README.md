# EduFinder CYL

Plataforma para la búsqueda y visualización de centros educativos y oferta de FP en Castilla y León.

## Requisitos

- Docker Desktop
- Node.js (opcional, para desarrollo local fuera de contenedores)

## Ejecución Rápida

Para levantar todo el entorno, ejecuta en la raíz del proyecto:

```bash
docker compose up -d --build
```

Esto iniciará los siguientes servicios:

| Servicio     | URL                                            | Descripción              |
| ------------ | ---------------------------------------------- | ------------------------ |
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Aplicación web (Next.js) |
| **Backend**  | [http://localhost:8000](http://localhost:8000) | API REST (Laravel)       |
| **PgAdmin**  | [http://localhost:5050](http://localhost:5050) | Gestión de Base de Datos |

## Credenciales

### PgAdmin

- **Email**: `admin@edufinder.com`
- **Password**: `edufinder`

### Base de Datos (PostgreSQL)

- **Usuario**: `edufinder`
- **Contraseña**: `edufinder`
- **Base de datos**: `edufinder`

## Datos

La aplicación ingesta automáticamente los datos de `data/centros.json` y `data/oferta_fp.json` al iniciar las migraciones con seeders.

## Estructura del Proyecto

- `/backend`: API Laravel con Sanctum y PostgreSQL.
- `/frontend`: Next.js 14, TailwindCSS, Leaflet.
- `/data`: Datasets JSON originales.

## Comandos Útiles

**Re-ejecutar migraciones y seeders:**

```bash
docker compose exec backend php artisan migrate:refresh --seed
```

**Ver logs:**

```bash
docker compose logs -f
```
