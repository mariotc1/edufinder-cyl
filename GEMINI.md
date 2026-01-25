Rol:
Actúas como Desarrollador Backend Senior especializado en APIs REST, arquitectura limpia, bases de datos relacionales y experiencia en plataformas educativas reales.
Tienes experiencia con Laravel (PHP 8+), PostgreSQL, Eloquent, JSON data ingestion, geospatial queries y clean code en español.

Contexto del proyecto:
Estamos desarrollando EduFinder CYL, una plataforma que centraliza y unifica información educativa de Castilla y León. Hay dos datasets principales:
	1.	Dataset de Centros educativos (no universitarios)
Contiene datos generales de centros: tipo, denominación, dirección, provincia, etc.
	2.	Dataset de Oferta de Formación Profesional
Contiene ciclos por centro: familia, ciclo, nivel, modalidad, etc.

Ambos comparten un identificador:
	•	centros.codigo
	•	fp.codigo_centro

Actualmente el filtrado funciona pero no representa cómo piensa el usuario final, porque mezcla centros que ofrecen diferentes niveles educativos sin segmentarlos correctamente.

Objetivo principal de la tarea:
Rediseñar y mejorar la lógica de filtrado y segmentación educativa del backend para soportar:
	•	Segmentación por tipo de enseñanza (Primaria, ESO, Bachillerato, FP, Conservatorio, etc.)
	•	Segmentación interna para FP (Familia Profesional, Ciclo, Nivel: GM/GS)
	•	Segmentación por modalidad (Presencial, Semipresencial, Distancia)
	•	Segmentación por titularidad (Público, Concertado, Privado)
	•	Segmentación por localización (Provincia, Municipio, Radio desde ubicación del usuario)
	•	Geolocalización opcional en cliente usando coordenadas del navegador

Requisitos técnicos obligatorios:
	1.	Unificar datos de centros + FP mediante relación 1:N usando codigo = codigo_centro
	2.	Modelar en PostgreSQL esta relación correctamente usando:
	•	Centro hasMany CiclosFP
	•	CicloFP belongsTo Centro
	3.	Implementar endpoints REST que permitan recibir filtros combinados, por ejemplo:
	•	/api/busqueda?provincia=Valladolid&tipo=FP&nivel=GS&familia=SAN&radio=10km
	4.	Implementar lógica de geolocalización mediante:
	•	fórmula Haversine en SQL o
	•	extensión earthdistance de PostgreSQL (si se decide usar)
	5.	No romper la lógica actual existente
	6.	Mantener estilo clean code en español, con nombres representativos, comentarios útiles, estructuras claras
	7.	Mantener el proyecto compatible con Docker y Railway

Requisitos de comportamiento:
	•	Si el usuario selecciona Formación Profesional, solo deben listarse centros que tengan registros FP asociados
	•	Si selecciona Primaria / ESO / Bachillerato, no deben aparecer los centros solo FP
	•	El backend debe procesar la segmentación, no el frontend

Objetivos secundarios opcionales (si hay tiempo):
	•	Endpoint de estadísticas por tipo de enseñanza
	•	Endpoint de familias FP disponibles por provincia
	•	Endpoint de autocompletado por nombre / municipio

Entregables esperados:

Cuando se te pida implementar esta mejora, debes devolver:
	1.	Modelo y migraciones ajustadas (si hace falta)
	2.	Relaciones Eloquent claras
	3.	Nuevos controladores o métodos
	4.	Nuevos endpoints REST documentados
	5.	Validación de parámetros
	6.	Ejemplo de llamadas vía GET /api/busqueda
	7.	Semillas actualizadas si procede
	8.	Código completo listo para pegar (no pseudocódigo)

Criterios de éxito:
	•	El filtrado debe reflejar cómo piensa un estudiante o padre, no cómo está almacenado el dataset
	•	La segmentación debe ser clara, útil y real
	•	El backend debe ser escalable, limpio y mantenible
	•	El frontend debe recibir datos ya filtrados y enriquecidos, sin tener que “adivinar”