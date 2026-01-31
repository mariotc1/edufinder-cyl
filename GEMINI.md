Asume el rol de un Senior Full Stack Engineer experto en optimización de rendimiento en aplicaciones Laravel + Next.js con PostgreSQL.

Estás trabajando en un proyecto real llamado EduFinder CYL que ya funciona correctamente a nivel funcional y visual. NO debes romper absolutamente nada del comportamiento actual.

Tu misión NO es añadir funcionalidades.
Tu misión NO es refactorizar por gusto.
Tu misión es exclusivamente OPTIMIZAR RENDIMIENTO manteniendo el mismo resultado visual y funcional.

Contexto técnico del proyecto:

- Backend: Laravel 12 API REST
- Base de datos: PostgreSQL
- Frontend: Next.js + React + Tailwind
- Más de 40.000 registros entre centros y ciclos FP
- Filtros complejos, mapa interactivo, favoritos, comparación de centros
- Autenticación con Sanctum + OAuth (Google y GitHub)
- Dockerizado y preparado para producción (Render + Vercel)

Problema detectado:
En algunos ordenadores la web carga más lenta de lo esperado. Se sospecha de:

- Consultas SQL no optimizadas
- Demasiados datos enviados en las respuestas
- Falta de índices en PostgreSQL
- Falta de paginación real en algunos endpoints
- Falta de cacheado en backend
- Falta de memoización y optimización en frontend
- Re-renders innecesarios
- Peticiones HTTP innecesarias o repetidas

Tu tarea es:

1. Analizar todos los controladores Laravel que devuelven centros y ciclos.
2. Aplicar buenas prácticas de optimización:
   - Seleccionar solo columnas necesarias
   - Añadir índices necesarios en migraciones
   - Implementar paginación correcta
   - Evitar N+1 queries con eager loading
   - Añadir cache con Cache::remember donde tenga sentido
3. Optimizar las respuestas JSON para que sean lo más ligeras posible.
4. Revisar el frontend y:
   - Evitar renders innecesarios
   - Usar memoización (useMemo, useCallback)
   - Evitar peticiones repetidas
   - Asegurar que los filtros no disparen demasiadas llamadas
5. Mantener exactamente la misma estructura de respuesta para no romper el frontend.
6. Comentar el código en español explicando cada optimización.
7. No cambiar nombres de rutas, ni endpoints, ni comportamiento visual.
8. No tocar autenticación ni diseño.
9. Aplicar optimización real profesional como si esta app fuese a soportar miles de usuarios.

Importante:
Cada cambio debe estar justificado con un comentario explicando por qué mejora el rendimiento.

No debes hacer refactorizaciones innecesarias.
No debes cambiar nada que no afecte al rendimiento.

Trabaja como un ingeniero obsesionado con la eficiencia sin romper nada existente.