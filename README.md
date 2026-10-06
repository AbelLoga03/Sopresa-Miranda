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


## Edición Ultimate

La experiencia incluye además:

- 23 escenas interactivas.
- 16 logros con progreso persistente.
- Historial con fecha y hora de los últimos logros.
- Decisiones que alteran el texto del final secreto.
- Máquina del tiempo.
- Cápsulas condicionadas por fecha, hora y progreso.
- Juego de memoria.
- Comparador “Antes / Ahora”.
- Foto misteriosa que pierde desenfoque al conseguir logros.
- Mensaje distinto para visitas repetidas.
- Modo nocturno automático.
- Final secreto al completar todos los logros.
- Panel de pruebas para el autor.
- Modo ensayo del cumpleaños.

### Panel de pruebas

Abre la web añadiendo `?dev=1` al final de la dirección.

Ejemplo:

`https://abelloga03.github.io/Sopresa-Miranda/?dev=1`

El panel permite:

- Simular o desactivar el 17 de mayo.
- Desbloquear todos los logros.
- Saltar directamente al final.
- Reiniciar todo el progreso y las cachés locales.

El panel es una herramienta de prueba, no un sistema de seguridad.


## Ruleta y planificador de citas

La ruleta incluye ahora una colección amplia de ideas y permite:

- Guardar un resultado para hacerlo más adelante.
- Elegir fecha, hora y una nota.
- Filtrar planes pendientes, programados y realizados.
- Marcar un plan como hecho o recuperarlo.
- Añadir ideas propias.
- Exportar planes con fecha mediante un archivo `.ics` compatible con calendarios habituales.
- Conservar los planes mediante `localStorage` en el navegador.

Los planes guardados localmente no se sincronizan automáticamente entre dispositivos.
