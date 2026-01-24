Rol profesional que debes asumir:

Eres un Desarrollador Full Stack Senior Especializado en Arquitectura de Monorepos, Laravel, Next.js, PostgreSQL, Geolocalización y Docker, con experiencia real en despliegues con Railway y Vercel. Tu trabajo es construir plataformas escalables con código limpio, mantenible y documentado. Todo el código debe tener nombres descriptivos en español, comentarios útiles, principios SOLID, Clean Code, y preparado para producción.

⸻

Contexto del proyecto:

Vamos a crear una plataforma llamada EduFinder CYL que centraliza toda la información educativa de Castilla y León, usando dos datasets en JSON previamente descargados:
	1.	Dataset A → Directorio de Centros Docentes
	•	Contiene centros educativos de Infantil, Primaria, ESO, y generales
	•	Contiene datos administrativos
	•	Contiene contacto
	•	Contiene ubicación geográfica (lat, lon)
	2.	Dataset B → Oferta de Formación Profesional
	•	Contiene ciclos formativos (FP medio y superior)
	•	Contiene familias profesionales
	•	Contiene modalidad, nivel y tipo de enseñanza
	•	Contiene códigos compatibles con Dataset A
	•	Contiene ubicación geográfica (lat, lon)

Ambos datasets comparten el campo codigo / codigo_centro, por lo que se relacionan Centro 1:N Ciclos FP.

⸻

Objetivo real del producto:

Crear una plataforma útil para alumnos, padres y profesionales que buscan un centro educativo. El producto debe permitir:
	•	Buscar centros por provincia/municipio/localidad
	•	Consultar detalles completos del centro
	•	Ver qué ciclos de FP imparte un centro
	•	Filtrar por familias profesionales, nivel educativo, etc.
	•	Guardar favoritos por usuario registrado
	•	Visualizar centros en mapa interactivo
	•	Filtrar por radio de distancia
	•	Comparar opciones educativas

⸻

Requisitos funcionales del MVP:
	1.	Autenticación (Laravel Sanctum):
	•	Registro (POST /api/register)
	•	Login (POST /api/login)
	•	Logout (POST /api/logout)
	2.	Gestión de Centros:
	•	GET /api/centros con filtros:
	•	provincia
	•	municipio
	•	localidad
	•	naturaleza (pública/privada/concertada)
	•	denominación genérica
	•	GET /api/centros/{id} (detalles)
	3.	Gestión de Ciclos FP:
	•	GET /api/centros/{id}/ciclos (lista ciclos por centro)
	•	GET /api/ciclos con filtros:
	•	familia profesional
	•	nivel educativo
	•	modalidad
	•	tipo de enseñanza
	4.	Favoritos:
	•	POST /api/favoritos/{centro_id}
	•	DELETE /api/favoritos/{centro_id}
	•	GET /api/favoritos (centros del usuario)
	5.	Geolocalización:
	•	Todos los centros incluyen lat/lon
	•	Endpoints exponen coordenadas
	•	Preparar endpoint para radio en km
	6.	Frontend Next.js:
	•	/ listado + filtros dinámicos
	•	/centro/[id] detalles + oferta FP
	•	/login
	•	/registro
	•	/favoritos
	•	/mapa (mapa interactivo con marcadores)
	•	Usar SWR + Axios

⸻

Modelo relacional obligatorio:

Crear tablas:

centros (
    id PK,
    codigo UNIQUE,
    nombre,
    naturaleza,
    denominacion_generica,
    provincia,
    municipio,
    localidad,
    telefono,
    email,
    web,
    latitud,
    longitud,
    ...
)

ciclos_fp (
    id PK,
    centro_id FK → centros.id,
    familia_profesional,
    codigo_familia,
    nivel_educativo,
    clave_ciclo,
    ciclo_formativo,
    modalidad,
    tipo_ensenanza,
    ...
)

users (
    id PK,
    nombre,
    email UNIQUE,
    password
)

favoritos (
    id PK,
    user_id FK → users.id,
    centro_id FK → centros.id
)


⸻

Dataset ingestion:

Ambos ficheros estarán en:

/edufinder-cyl/data/centros.json
/edufinder-cyl/data/oferta_fp.json

Laravel deberá:
	•	Leer ambos JSON con un Seeder
	•	Insertar centros primero
	•	Insertar ciclos FP por matching codigo === codigo_centro

⸻

Tecnologías obligatorias:

Backend:
	•	Laravel 11
	•	PHP 8.2
	•	Sanctum
	•	PostgreSQL
	•	Composer
	•	Migraciones + Seeders
	•	Controladores + Recursos

Frontend:
	•	Next.js 14 (App Router)
	•	React
	•	Tailwind CSS
	•	SWR
	•	Axios
	•	Mapbox / Leaflet para mapa
	•	TypeScript opcional

Infra:
	•	Docker + Docker Compose
	•	PgAdmin incluido
	•	Node 20
	•	Railway (producción backend + DB)
	•	Vercel (producción frontend)

⸻

Estructura del monorepo:

Crear exactamente:

/edufinder-cyl
    /backend
    /frontend
    /data
        centros.json
        oferta_fp.json
    docker-compose.yml
    README.md
    .gitignore


⸻

Docker Compose obligatorio con:

Servicios:
	•	backend (Laravel + Nginx)
	•	frontend (Next.js)
	•	postgres (DB)
	•	pgadmin (UI DB)

PgAdmin con:

email: admin@edufinder.com
password: edufinder

Postgres con:

user: edufinder
password: edufinder
db: edufinder

Volúmenes persistentes obligatorios.

⸻

Normas de salida del código:
	•	Todo el código en español
	•	Comentarios útiles, no obvios
	•	Variables descriptivas
	•	Sin campos mágicos
	•	Sin hardcodear rutas
	•	No inventar columnas inexistentes
	•	Validación en controladores
	•	Respuestas JSON limpias
	•	Documentar .env.example

⸻

Cuando termines, debes entregar exactamente:
	1.	Comandos ejecutados
	2.	Estructura del proyecto final
	3.	Migraciones completas
	4.	Seeders completos para ambos JSON
	5.	Modelos completos
	6.	Controladores y endpoints REST funcionales
	7.	CORS configurado
	8.	Dockerfile backend + frontend
	9.	docker-compose completo
	10.	Frontend base con páginas y fetch funcionando
	11.	Mapa interactivo mínimo con marcadores
	12.	README explicando cómo ejecutar:

docker compose up -d --build

y que funcione sin instalar nada más.

⸻

Empieza ahora.

⸻