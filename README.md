# 🎓 EduFinder CyL

<div align="center">

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

**La plataforma definitiva para la búsqueda de centros educativos y Formación Profesional en Castilla y León.**

[🚀 Ver Demo Online](https://edufinder-cyl.vercel.app) • [📹 Ver Video Demo](https://drive.google.com/file/d/1ljQkEfAiii0pDApF5E8khZnMtEd4Ei9_/view?usp=sharing) • [⚙️ API Backend](https://edufinder-cyl.onrender.com)

</div>

---

## 📋 Sobre el Proyecto

**EduFinder CyL** es una aplicación web moderna diseñada para facilitar el acceso a la información educativa en la comunidad de Castilla y León. Utilizando datos abiertos de la Junta, ofrecemos una experiencia de usuario premium para buscar, filtrar y comparar centros educativos.

### ✨ Funcionalidades Clave

- **🔍 Búsqueda Inteligente**: Encuentra centros por nombre, localidad o tipo de oferta.
- **🗺️ Mapa Interactivo**: Visualización geoespacial de centros con clustering y filtros de radio dinámicos.
- **⚖️ Comparador de Centros**: Compara lado a lado hasta 3 centros para analizar su oferta educativa.
- **❤️ Favoritos y Listas**: Guarda tus centros de interés (requiere registro).
- **📱 Diseño Responsive**: Experiencia fluida en móvil, tablet y escritorio.

---

## 🛠️ Stack Tecnológico

Este proyecto utiliza una arquitectura moderna separada en frontend y backend:

### **Frontend (Cliente)**

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS 4 + Framer Motion (Animaciones)
- **Mapas**: React Leaflet
- **Estado**: Context API + SWR
- **Deploy**: Vercel

### **Backend (Servidor)**

- **Framework**: Laravel 11 API
- **Base de Datos**: PostgreSQL
- **Autenticación**: Laravel Sanctum
- **Despliegue**: Docker & Render

---

## 🚀 Guía de Instalación (Paso a Paso)

Sigue estos pasos para levantar el proyecto completo en tu máquina local.

### 1️⃣ Prerrequisitos

Lo único que necesitas instalar obligatoriamente es **Docker Desktop**.

- [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/) (Asegúrate de que esté abierto y funcionando).

### 2️⃣ Clonar el Repositorio

Abre tu terminal y descarga el código:

```bash
git clone https://github.com/mariotc1/edufinder-cyl.git
cd edufinder-cyl
```

### 3️⃣ Configuración del Entorno

Necesitamos configurar las "variables de entorno" para que el proyecto sepa cómo conectarse. Hemos preparado archivos de ejemplo listos para usar.

**Configurar Backend:**
Copia el archivo de ejemplo a `.env`.

```bash
cd backend
cp .env.example .env
cd ..
```

**Configurar Frontend:**
Copia el archivo de ejemplo a `.env.local`.

```bash
cd frontend
cp .env.example .env.local
cd ..
```

_(No necesitas editar nada en estos archivos para que funcione en local, ya vienen preconfigurados para Docker)._

### 4️⃣ Encender los Servidores (Docker)

Desde la raíz del proyecto (donde está el archivo `docker-compose.yml`), ejecuta:

```bash
docker compose up -d --build
```

⏳ **Espera unos minutos**. Esto descargará las imágenes, construirá el frontend y levantará la base de datos.
Puedes ver si ha terminado cuando `docker compose ps` muestre todos los contenedores en estado `Running`.

### 5️⃣ Instalación de Dependencias y Base de Datos

Una vez que los contenedores están arriba, necesitamos instalar las librerías dentro de ellos y alimentar la base de datos. Ejecuta estos comandos **en orden**:

**A. Instalar librerías PHP (Backend):**

```bash
docker compose exec backend composer install
```

**B. Instalar librerías Node (Frontend):**

```bash
docker compose exec frontend npm install
```

**C. Generar clave de seguridad:**

```bash
docker compose exec backend php artisan key:generate
```

**D. Crear Base de Datos y Datos de Prueba (Seeders):**

```bash
docker compose exec backend php artisan migrate:refresh --seed
```

_> Este paso importará automáticamente los centros y ciclos desde los archivos JSON._

**E. Enlazar almacenamiento de imágenes:**

```bash
docker compose exec backend php artisan storage:link
```

---

## ✅ ¡Todo Listo!

Accede a la aplicación en tu navegador:

| Aplicación               | URL Local                                      | Credenciales por defecto                             |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| **Frontend**             | [http://localhost:3000](http://localhost:3000) | -                                                    |
| **Backend API**          | [http://localhost:8000](http://localhost:8000) | -                                                    |
| **Gestión DB (PgAdmin)** | [http://localhost:5050](http://localhost:5050) | **User**: admin@edufinder.com<br>**Pass**: edufinder |

### Usuarios de Prueba

Puedes iniciar sesión con:

- **Email**: `test@example.com`
- **Contraseña**: `password`

---

## 📂 Estructura del Proyecto

```bash
edufinder-cyl/
├── backend/            # API Laravel
│   ├── app/            # Controladores y Modelos
│   ├── database/       # Migraciones y Seeders
│   └── routes/         # Definición de API (api.php)
├── frontend/           # Next.js App
│   ├── src/app/        # Páginas y Rutas
│   ├── src/components/ # Componentes Reutilizables (UI)
│   └── src/lib/        # Utilidades y configuración Axios
├── data/               # Archivos JSON originales (Open Data)
└── docker-compose.yml  # Orquestación de contenedores
```

---

## 👥 Autores

Proyecto desarrollado por:

- **Mario Tomé** - [GitHub](https://github.com/mariotc1) • [LinkedIn](https://www.linkedin.com/in/mario-tome-core/)
- **Raúl Ortega** - [GitHub](https://github.com/Raul9097)

---

> **Open Data Contest 2026** - _Datos facilitados por la Junta de Castilla y León._
