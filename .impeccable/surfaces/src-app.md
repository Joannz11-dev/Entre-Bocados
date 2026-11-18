---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: ["src/app/index.tsx","src/app/explore.tsx","src/app/preferences.tsx","src/app/favorites.tsx","src/app/plans.tsx","src/app/profile.tsx","src/app/login.tsx","src/app/register.tsx"]
---

# Surface brief — Entre Bocados (rediseño completo de la app)

## Scope & visitor mode

Rediseño completo del mundo visual de la app Expo (todas las pantallas en `src/app`) según el mockup aprobado por el usuario. Modo **Operate**: el usuario vino a decidir dónde comer y con quién; la expresión nunca estorba la tarea. Plataforma: Android (Expo/React Native), verificación visual en web (react-native-web) y pantallas nativas equivalentes.

## Audience, job, action, proof, constraints

- Público: jóvenes en Bogotá decidiendo dónde comer, en plan solo, de pareja o de grupo.
- Acción: deslizar para decidir, guardar favoritos, armar planes, girar la ruleta cuando no hay ideas, chatear el plan del dúo.
- Prueba: catálogo real de Supabase (Usaquén y Chapinero) con datos verificables; lo social es simulado y se nombra.
- Constraints: demo sin backend de usuarios; estados vacíos de primera clase (solo 2 localidades con datos); precios sin verificar quedan fuera del filtro de presupuesto; gestos duplicados como botones; español colombiano.

## Chosen direction

**"Feria jugosa"** — el mockup es ley (dirección fijada por el usuario, no hay roll). El mundo: mesa de comida colombiana en un festival de sabor — crema cálido de fondo, rosa/magenta que antoja, violeta de fiesta, acentos naranja/verde/ámbar; tarjetas pastelería muy redondeadas (24–28) con sombras suaves con offset; chips pastel con tinta saturada; botones píldora con "squish" al tocar; mascota niño chef vectorial (SVG propio) que celebra y acompaña; tipografía Baloo 2 (display redondeada y gorda) + Nunito (cuerpo). Motivo firma: la baraja de swipe con overlays jugosos (ME ENCANTA / NOPE) y la celebración "¡Es un Match!" con confeti.

## Memorable moment

El swipe que se lleva la tarjeta con física de muelle, sello deOverlay jugoso y háptico, y si había match pendiente: confeti + mascota abrazando un corazón.

## Direction contract

**THESIS:** La decisión de dónde comer se siente como un festival de mesa compartida: la app es la feria jugosa donde cada swipe, chip y ruleta es un bocado. Se rechaza el directorio neutro gris-acento (el default de la categoría "app de restaurantes") y también el CRUD demo que dejó el incumbente: el producto demuestra sabor, no administra datos.

**OWN-WORLD:** Fondo crema cálido (#FFF3E9) con blobs pastel flotantes (violeta/durazno) en las esquinas; tarjetas pastelería blancas radio 24–28 con sombra suave con offset (0/8 + blur 24, tinta del hue); rosa magenta (#F43F6D) lleva la acción primaria, violeta (#7C4DFF) la social, verde (#22C55E) el éxito, ámbar/durazno los acentos; chips pastel con tinta saturada del mismo hue (nunca gris); botones píldora gruesos con squish y sombra con offset; tipografía Baloo 2 gorda y redondeada para display, Nunito para cuerpo; mascota niño chef en SVG vectorial propia (sin emoji, sin raster generado).

**STORY:** El visitado entiende en segundos: esto decide dónde comer (Explorar con swipe), con quién (Conectar simulado con match y chat), y el plan (Dúo con planes y ruleta). Hace: desliza, guarda, gira la ruleta, une al grupo, confirma el plan en el chat. Cree: que este catálogo local es real y que la capa social es un juego honesto — ambas cosas se nombran en pantalla.

**FIRST VIEWPORT:** Bienvenida (`/`): pantalla crema con blobs; mascota chef grande centrada arriba (≈40% del alto); lockup "Entre Bocados" en Baloo 2 gorda con cucharita (violeta + rosa), tagline "Descubre, comparte y disfruta" debajo; hero-tarjeta blanca redondeada con la promesa y el botón primario píldora rosa "¡Comencemos!" abajo; acciones secundarias en texto/violeta. En el shell de tabs: tab bar pastelería flotante con 4 paradas (Explorar, Conectar, Planes, Perfil) con íconos y squish animado.

**FORM:** Dirección fijada por el mockup del usuario (Figura 1) — "A user- or brief-pinned direction beats the roll": sin lista ordenada ni roll; `seed: none (brief-pinned)`. El mockup aporta mundo, módulos y topología; el arte vectorial, la tipografía concreta y la física de motion se elevan a sistema en esta ronda.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions

- Verificación nativa en emulador: si no hay dispositivo/emulador, la evidencia visual sale del build web (react-native-web) y se declara así.
- Ícono de app y splash brandeados: fuera de alcance de esta ronda si el tiempo lo exige; el splash cambia a crema de marca.
