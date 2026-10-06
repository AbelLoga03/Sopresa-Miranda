# Sorpresa para Miranda ✦

Web interactiva de cumpleaños preparada como una experiencia por capítulos.

## Incluye

- Cuenta atrás configurable.
- Línea temporal de recuerdos.
- Constelación interactiva.
- Galería estilo Polaroid.
- Recuerdo aleatorio.
- Mini juego de 3 preguntas con puntuación.
- Sección de números y fechas.
- Razones/mensajes aleatorios.
- Sobres “Ábrelo cuando…”.
- Cápsula del tiempo con planes futuros.
- Ruleta de planes.
- Carta final animada.
- Cuenta atrás cinematográfica antes de la sorpresa final.
- Easter egg oculto.
- Efectos al tocar/clicar.
- Diseño responsive para móvil y ordenador.
- Ambiente sonoro opcional.

## Personalización rápida

La mayoría de datos que cambian están al principio de `js/app.js`, dentro de `CONFIG`.

Ahí se puede configurar:

- `birthday`: fecha y hora del cumpleaños.
- `relationshipStart`: fecha especial para calcular días.
- `reasons`: frases.
- `plans`: planes de la ruleta.
- `quiz`: preguntas, respuestas y solución.

Los textos largos, timeline, sobres, carta y sorpresa se editan en `index.html`.

## Fotos

Las fotos reales se añadirán más adelante dentro de `images/`. Hasta entonces se mantienen placeholders para no publicar imágenes personales por accidente.

## Música

Se puede añadir un archivo dentro de `audio/` y sustituir el ambiente generado por el navegador por una canción elegida por el autor. Evita subir música con copyright si la web va a ser pública.

## Publicación

La web es estática y está preparada para GitHub Pages desde la rama `main`.
