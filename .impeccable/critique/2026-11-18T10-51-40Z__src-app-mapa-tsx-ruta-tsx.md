---
target: Mapa de la ronda + Ruleta de rutas (sistema completo)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\roca12\\OneDrive\\Escritorio\\Entre-Bocados\\src\\app\\mapa.tsx+ruta.tsx"
timestamp: 2026-11-18T10-51-40Z
slug: src-app-mapa-tsx-ruta-tsx
---
# Critique — Mapa de la ronda + Ruleta de rutas (y el sistema de identidad que las rodea)

Method: design review only (detector not applicable, native platform). Target: `src/app/mapa.tsx` + `src/app/ruta.tsx` (+ `components/kit/osm-map.tsx`, `kit/ui.tsx`, `kit/tab-bar.tsx` como contexto del sistema).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Giro de 2.8 s sin feedback intermedio (sin ticks/progreso); mapa sin skeleton de marca |
| 2 | Match System / Real World | 2 | La ruleta es decorativa: 8 gajos anónimos, el resultado no se puede anticipar |
| 3 | User Control and Freedom | 2 | Mapa sin botón de volver en la parte superior (solo enlace de texto abajo); giro no cancelable |
| 4 | Consistency and Standards | 2 | Drift de rol de color en Ruta (hub rosa, resultado violeta; identidad naranja ausente); radio 16 fuera de escala |
| 5 | Error Prevention | 3 | Giro bloqueado con lista vacía y durante el giro; presupuesto explicado |
| 6 | Recognition Rather Than Recall | 2 | Los gajos no muestran nombres; el usuario debe confiar en la nota informativa |
| 7 | Flexibility and Efficiency | 2 | Desde el mapa no se llega al detalle del lugar; atajo perdido |
| 8 | Aesthetic and Minimalist Design | 2 | Mapa en tiles OSM por defecto (azul-verde frío) dentro de un mundo crema; ruleta genérica |
| 9 | Error Recovery | 3 | FeedbackPill en giro vacío; recuperación de permiso con botón |
| 10 | Help and Documentation | 3 | Nota honesta de azar y filtros presente en Ruta |

**Total: 23/40 — Acceptable** (mejoras significativas antes de que los usuarios lo disfruten).

## Design Specificity Verdict

El sistema alrededor (baraja de swipe, mascota, kit de píldoras) está fuertemente autoriado — nadie más podría usarlo sin cambio. **El mapa y la ruleta son las dos superficies más intercambiables por categoría**: un mapa Leaflet con tiles por defecto y una ruleta de premio genérica. Justo donde el usuario pide "más", el mundo "Feria jugosa" se apaga.

**Deterministic scan:** not applicable (native platform).

## What's Working

- **Honestidad demo bien puesta:** la nota de azar + filtros activos en Ruta y el aviso ámbar de permiso en Mapa nombran la verdad sin romper el tono.
- **Duplicación de accesibilidad:** el gesto de girar tiene botón dedicado (hub + primario) y estados deshabilitados; consistent con la regla de producto.
- **El sistema de tokens es sano:** Type/Shadow/Radius de `theme.ts` son coherentes; los defectos son locales, no del sistema.

## Priority Issues

**[P1] La ruleta es decorativa, no funcional.** 8 gajos de color sólido sin nombres: el usuario ve colores, no opciones; el desenlace es invisible hasta aterrizar; 2.8 s de suspenso sin un solo tick. *Por qué importa:* es el momento firma de la app y hoy es un arcoíris anónimo; la anticipación (el motor emocional de una ruleta) no existe. *Fix:* rueda real — gajos con los nombres de los `visible` (n = 2–8), tinta con contraste AA por gajo, puntero pin de marca, hápticos por gajo durante el giro, aterrizaje que revela el nombre bajo el puntero. *Suggested command:* polish.

**[P1] El mapa es un objeto extraño en el mundo de la marca.** Tiles OSM por defecto (paleta fría azul-verde) contra crema cálido; pines genéricos; sin barra superior con volver (patrón del kit sin usar); estados de permiso/vacío en placeholder blanco sin mascota; del mapa no se llega al lugar. *Por qué importa:* es la segunda superficie que el usuario pidió mejorar y es donde más se nota "aplicativo web embebido". *Fix:* tiles cálidos (Voyager), pines y popup de marca, top bar nativa + volver, estados con mascota, franja horizontal de lugares cerca → detalle. *Suggested command:* polish.

**[P2] Drift del rol de color en Ruta.** El hub es rosa y "Guardar como plan" violeta mientras la identidad naranja de Rutas (regla del sistema: naranja = rutas y ruleta) casi no aparece. *Fix:* `OrangeButton` (relleno Naranja Tostado #A84B05, pasa AA con blanco) como CTA de girar; acentos naranja en resultado; violeta se queda para lo social. *Suggested command:* polish + extract.

**[P2] Drift nativo en la barra de tabs.** El activo cambia solo el color del ícono; DESIGN.md promete burbuja rosa-soft (indicador Material 3). *Fix:* píldora rosa-soft detrás del ícono activo. *Suggested command:* polish.

**[P2] Defectos locales y de código.** `resultTimer` nunca se limpia al desmontar (fuga + `runOnJS` tras desmontar el giro); `noteCard` radio 16 fuera de escala (12/14/18); imports duplicados en línea 6 de `mapa.tsx`; JSX roto en el texto del estado vacío del mapa; confeti modesto (18) para el pico emocional. *Suggested command:* polish.

## Persona Red Flags

**Casey (móvil, una mano):** volver del mapa vive abajo como texto subrayado (zona de pulgar correcta, patrón incorrecto); el resultado de la ruleta sitúa bien sus acciones; la franja de lugares cerca resuelve el "ver qué hay" sin pellizcar el mapa.
**Riley (estresador):** desmontar Ruta durante el giro provoca setState post-monte y timer huérfano — silencioso y real. Doble toque de giro: bien bloqueado.
**Sam (accesibilidad):** el desenlace de la ruleta no se anuncia (falta región live); las etiquetas SVG del gajo no son legibles por lector de pantalla — el botón primario accesible compensa, pero el resultado debe anunciarse.
**Dúo planner (persona del proyecto):** aterrizar → guardar plan es 1 toque ✓; desde el mapa no puede abrir el lugar (falta el atajo obvio).

## Minor Observations

- Skeleton del mapa: el estado de carga es texto plano; el sistema ya tiene pulso en Explorar.
- El chip de filtro de Ruta y el de Explorar son casi iguales con estilos duplicados locales.
- `finishSpin` asume 8 gajos fijos; al generalizar n, revisar la fórmula de aterrizaje.
- Los diamantes decorativos del gajo chocarán con etiquetas futuras: reemplazar por separadores/anillo.

## Questions to Consider

- ¿Y si la ruleta anticipa el sabor: los gajos muestran los lugares reales y el puntero cae sobre el que va a visitar?
- ¿Y si el mapa se sintiera dibujado en la misma mesa: tiles cálidos, pines pastelería y popup con la tipografía de la marca?
- ¿Qué pasaría si cada superficie tiene su color de identidad (rosa=decidir, violeta=social, naranja=ruta, verde=lugar) en vez de rosa por defecto?
