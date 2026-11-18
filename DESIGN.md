---
name: Entre Bocados
description: App demo para descubrir dónde comer en Bogotá — mundo visual "Feria jugosa"
colors:
  cream: "#FFF3E9"
  cream-deep: "#FCE4D2"
  white: "#FFFFFF"
  ink: "#401F33"
  ink-soft: "#7A5566"
  pink: "#F43F6D"
  pink-fill: "#E0245A"
  pink-deep: "#B81B44"
  pink-soft: "#FFE1EA"
  violet: "#7C4DFF"
  violet-deep: "#6A38F0"
  violet-soft: "#EDE7FF"
  orange: "#FF8A3D"
  orange-deep: "#A84B05"
  orange-soft: "#FFE7D1"
  green: "#17A55C"
  green-deep: "#0E7A43"
  green-soft: "#DCF6E7"
  amber: "#FFC531"
  amber-deep: "#8A6205"
  amber-soft: "#FFF2D2"
  line: "#F3D9C8"
typography:
  display:
    fontFamily: "Baloo2_800ExtraBold, Baloo2_700Bold, ui-rounded, system-ui"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.18
    letterSpacing: "normal"
  headline:
    fontFamily: "Baloo2_700Bold"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Baloo2_700Bold"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Nunito_600SemiBold"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.55
  label:
    fontFamily: "Nunito_800ExtraBold"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.38
    letterSpacing: "0.4px"
rounded:
  chip: "999px"
  input: "18px"
  card: "24px"
  sheet: "28px"
spacing:
  xs: "4px"
  s: "8px"
  m: "16px"
  l: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.pink-fill}"
    textColor: "{colors.white}"
    rounded: "{rounded.chip}"
    height: "54px"
    padding: "0 24px"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.violet-deep}"
    rounded: "{rounded.chip}"
    height: "54px"
    padding: "0 24px"
  chip:
    backgroundColor: "{colors.violet-soft}"
    textColor: "{colors.violet-deep}"
    rounded: "{rounded.chip}"
    height: "40px"
    padding: "0 14px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "16px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "52px"
---

# Design System: Entre Bocados

## Overview

**Creative North Star: "Feria jugosa"** — la mesa de un festival de comida colombiana convertida en app: crema cálido como mantel, rosas y violetas que antojan, tarjetas de pastelería y una mascota niño chef que acompaña cada decisión.

El mundo pertenece a la marca y fue fijado por el mockup aprobado por el usuario. Todo es redondez amable (nunca una esquina dura), todo tiene relleno con tinta del mismo tono (nunca gris sobre color), y todo lo simulado se nombra en pantalla con una nota honesta y cálida. El movimiento es físico y tierno: muelles con squish al tocar, sellos que suben con el swipe, confeti propio en las celebraciones. La expresión nunca estorba la tarea: cada pantalla resuelve en segundos (deslizar, guardar, planear, girar).

**Key Characteristics:**
- Suelo crema #FFF3E9 con blobs pastel de esquina (rosa/violeta/durazno) en cada pantalla.
- Tarjetas blancas de pastelería (radio 24–28) con sombra suave con offset.
- Píldora como forma dominante: botones, chips, tab bar y avatares.
- Mascota vectorial propia (niño chef) en poses wave/heart; sin emoji como sistema de íconos (Feather).
- Nunito para cuerpo, Baloo 2 gorda para display; español colombiano juguetón.

## Colors

Paleta dulce de feria: un crema que sostiene todo, una familia rosa que antoja, una violeta de fiesta y acentos naranja/verde/ámbar; cada tinta vive sobre su pastel del mismo tono.

### Primary
- **Rosa Antojo** (#F43F6D): sellos de swipe y display grande (≥24px). Solo en textos/elementos grandes: no pasa AA en texto pequeño.
- **Rosa Relleno** (#E0245A): botón primario y burbujas de acción — pasa AA (≥4.5:1) con texto blanco.
- **Rosa Profundo** (#B81B44): tinta de chips rosa y estados presionados.

### Secondary
- **Violeta Fiesta** (#7C4DFF) / **Violeta Profundo** (#6A38F0): capa social (Conectar, chat, grupos), botón secundario y avatares.
- **Verde Manso** (#17A55C) / **Verde Profundo** (#0E7A43): éxito, confirmación, localidad, "en línea".

### Tertiary
- **Durazno Caliente** (#FF8A3D) / **Naranja Tostado** (#A84B05): rutas y ruleta.
- **Miel** (#FFC531) / **Miel Tostada** (#8A6205): presupuesto y acentos de favorito.

### Neutral
- **Crema Mesa** (#FFF3E9): fondo de toda la app.
- **Crema Hundido** (#FCE4D2): superficies secundarias y blobs.
- **Tinta Ciruela** (#401F33): texto principal y trazos de la mascota.
- **Ciruela Suave** (#7A5566): texto secundario (AA sobre crema y blanco).
- **Línea Arepa** (#F3D9C8): bordes suaves de inputs.

### Named Rules
**La Regla del Mismo Tono.** Cada chip es un pastel con tinta de su propio tono (rosa sobre rosa, violeta sobre violeta); el gris jamás tiñe un chip.
**La Regla del Relleno Honesto.** Un color lleno carga texto blanco solo si pasa 4.5:1 — por eso el botón primario usa #E0245A y no #F43F6D.
**La Regla del Aviso.** Todo módulo simulado lleva su nota demo en crema hundido (o violeta suave); el encanto nunca borra la honestidad.

## Typography

**Display Font:** Baloo 2 (Baloo2_700Bold/800ExtraBold, cargada con expo-font)
**Body Font:** Nunito (Nunito_600SemiBold/800ExtraBold)

**Character:** Pareja redonda y gorda — Baloo 2 tiene la panza de un letrero de dulcería y Nunito la calidez de un cuerpo humanista; juntas suenan a menú escrito a mano con buena letra.

### Hierarchy
- **Display** (Baloo2_800, 34px, 40): títulos de pantalla ("¿Sin ideas?", "Nuestros planes"). Máximo 40px.
- **Title** (Baloo2_700, 24px, 30): encabezados de tarjetas hero y nombres de lugar.
- **Headline** (Baloo2_700, 18px, 24): títulos de sección y de tarjeta.
- **Body** (Nunito_600, 15px, 23): descripciones y copy.
- **Label** (Nunito_800, 13px, tracking 0.4): botones, chips y meta ("Sáb. 7pm").
- **Micro** (Nunito_800, 11px, tracking 0.6): sellos de estado y etiquetas de demo.

### Named Rules
**La Regla del Panzón.** El display siempre Baloo 2; el system font nunca es la voz display de la marca.

## Layout

Columna única móvil (objetivo ≤560px centrado en pantallas anchas), padding horizontal 24, ritmo de espaciado en pasos de 4 (8/16/24/32) con más aire encima de los títulos que debajo. Las pantallas de tabs dejan 96–104px de fondo para la tab bar flotante; los stack screens (detalle, chat, ruleta) cubren todo con SafeArea. Los estados vacíos, de carga (skeleton con pulso) y de error con reintacto son de primera clase en cada pantalla.

## Elevation & Depth

Sombra suave con offset y desenfoque — pastelería apoyada en la mesa, nunca halos de cero offset.

### Shadow Vocabulary
- **card** (`shadow 0 10 22 rgba(64,31,51,0.10–0.12)` / elevation 5 Android): tarjetas, chips contenedores, botones.
- **float** (`shadow 0 12 26 rgba(64,31,51,0.16)` / elevation 8): tab bar, hubs de ruleta, avatares destacados.

### Named Rules
**La Regla del Repostero.** Toda sombra lleva offset y blur; si no se puede leer como papel sobre la mesa, no se usa.

## Shapes

Forma de pastelería: píldoras (999) para botones/chips/tab bar, tarjetas 24–28, inputs 18. Bordas de 2px solo en inputs (Línea Arepa) y sellos de swipe (3px con la tinta del tono). La mascota y las ilustraciones de cocina comparten trazo ciruela de 3.5px con esquinas redondas.

## Components

### Buttons
- **Shape:** píldora 999, alto 54 (small 46), mínimo 48dp de objetivo táctil.
- **Primary:** Rosa Relleno #E0245A + texto blanco Nunito_800 16; sombra card; squish 0.94 al presionar.
- **Ghost:** blanco + borde 2 violeta-soft + texto Violeta Profundo.
- **Violet:** Violeta Fiesta para acciones sociales.
- **Feedback:** háptico ligero al presionar (expo-haptics), nunca cambia el layout.

### Chips
- **Style:** pastel del tono + tinta del mismo tono, alto 40, padding 14.
- **State:** seleccionado = relleno profundo con texto blanco; siempre con icono Feather de 13px cuando aporta.

### Cards / Containers
- **Corner Style:** 24 (sheet 28 para héroes y resultado de ruleta).
- **Background:** blanco sobre crema; héroes de color lleno (violeta en perfil).
- **Internal Padding:** 16 (hero 24).

### Inputs / Fields
- **Style:** blanco, borde 2 Línea Arepa, radio 18, alto 52; label Nunito_800 arriba, nota debajo.
- **Placeholder:** Ciruela Suave.

### Navigation
- **Tab bar:** píldora flotante blanca con sombra float, 4 paradas (Explorar/Conectar/Planes/Perfil); activa = burbuja rosa-soft + icono y texto Rosa Profundo.
- **Top bar de stack:** botón circular blanco 44 con flecha + título.

### Baraja de Swipe (signature)
- Tarjetas blancas radio 26 con foto/losa de cocina arriba (300px) y cuerpo con nombre Baloo 2, precio rosa y chips meta; pila de 3 con escala y offset por profundidad.
- Sellos ME INTERESA (rosa) / NOPE (violeta) / FAVORITO (miel) que suben con el arrastre; salida con tiro y háptico en el umbral.

### Losa de Cocina
- Ilustración vectorial propia por cocina (gradiente del tono + plato + cubiertos + trama de puntos); sustituye fotos no autorizadas y lo dice en pantalla.

## Do's and Don'ts

### Do:
- **Do** usar crema #FFF3E9 como único fondo de pantalla y blobs pastel para que nunca sea plano.
- **Do** emparejar cada pastel de chip con la tinta profunda de su mismo tono.
- **Do** animar con muelles (spring damping 10–16) y un momento firma por pantalla (deck, ruleta, confeti).
- **Do** nombrar lo simulado con su nota demo en cada módulo social.

### Don't:
- **Don't** usar gris como tinta sobre superficies de color, ni halos de sombra sin offset.
- **Don't** usar emoji como sistema de íconos (solo como avatar del usuario o dentro del texto de un mensaje).
- **Don't** inventar reseñas, distancias de lugares reales ni fotografías no autorizadas: la losa de cocina y "Precio por confirmar" existen para eso.
- **Don't** poner kickers/eyebrows sobre los títulos: el heading habla solo.
- **Don't** desplegar el rosa #F43F6D detrás de texto pequeño: pasa a #E0245A o sube el tamaño a display.

## Addendum — Pase profesional de producto (2026-11-18)

La dirección de la marca (crema, rosa/violeta, mascota, Baloo 2 + Nunito) se mantiene, pero el cliente pidió explícitamente: cara de **app nativa Android**, cero emojis y tono profesional para entrega. Cambios vigentes por encima de las reglas anteriores:

- **Cero emojis**: ni avatares ni dentro de mensajes. Los avatares son monograma (iniciales sobre círculo blanco o tinta del tono). Esta regla reemplaza la excepción previa de "emoji como avatar".
- **Barra de navegación nativa**: superficie blanca sólida a todo lo ancho con hairline superior (Línea Arepa), ícono + etiqueta, activo en Rosa Profundo. Reemplaza la píldora flotante.
- **Radios sobrios**: tarjeta 14, sheet 18, input 12 (antes 24/28/18). Las píldoras (999) quedan solo para chips y botones.
- **Elevación discreta**: card = offset 0/3, blur 10, 6–8% (elevation 2); float = 0/4, blur 12 (elevation 3). La "Regla del Repostero" se suaviza: nada de nubes, sí un apoyo mínimo.
- **Blobs pastel solo en la bienvenida**: las pantallas de trabajo van sobre crema plano; el suelo decorativo es de la marca, no de la tarea.
- **Autenticación real visible**: formularios de acceso con estructura nativa (labels, estados de error en rosa profundo, carga deshabilitando el botón), sin notas de "demo" en el flujo de sesión; la honestidad demo se reserva ahora a los módulos sociales.
