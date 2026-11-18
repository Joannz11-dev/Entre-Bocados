# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Personas en Bogotá decidiendo dónde comer hoy y con quién: jóvenes locales que exploran restaurantes por localidad, presupuesto y disponibilidad, a veces en plan de pareja o de grupo de amigos. Cada usuario crea una cuenta real (correo + contraseña con confirmación por correo) y el evaluador recorre todos los módulos con su propia sesión.

## Product Purpose

Entre Bocados ayuda a descubrir dónde comer y con quién compartirlo. La app consulta un catálogo real de restaurantes publicados (Supabase Data API), permite deslizar para decidir, guardar favoritos y armar planes. El ángulo diferencial es el acompañamiento: "Descubre, comparte y disfruta" — el plan de comida como evento social.

## Positioning

Un catálogo local curado de Bogotá (fuentes oficiales, fecha de verificación) combinado con la capa social de planes: ni directorio ni delivery; es el puente entre "dónde" y "con quién". La capa social es simulada con honestidad total.

## Operating Context

- Catálogo vía Data API de Supabase (`.env.local` con `EXPO_PUBLIC_SUPABASE_URL` y clave publicable). Requiere internet; la app distingue error de conexión de catálogo vacío y permite reintentar.
- Autenticación real con Supabase Auth (correo + contraseña): registro con confirmación por correo, inicio de sesión, recuperación de contraseña por correo, cierre de sesión y sesión persistente en el dispositivo. El enlace del correo regresa a la app mediante deep link (`exp://**`, `entrebocados://**` en la lista de redirecciones del proyecto).
- El SMTP integrado de Supabase tiene un límite bajo de correos por hora: para demostraciones en vivo se usan cuentas previamente confirmadas (creadas por administración) y el flujo de correo se muestra una sola vez.
- Datos personales (alias, favoritos, planes, preferencias) solo en el dispositivo (AsyncStorage).
- Matches, dúos, grupos y chat siguen siendo simulados: no vinculan personas reales ni crean reservas. Cada módulo social debe nombrar su condición de simulación (precedente en la demo: "Sofía" y "Casa Tomillo" ficticios).
- Demo enfocada a Android (APK preview vía EAS, `co.entrebocados.demo`); también corre en web (react-native-web) y Expo Go.
- Gestos de Explorar heredados: izquierda pasar, derecha interés, arriba favorito — siempre duplicados como botones y acciones de accesibilidad.

## Capabilities and Constraints

- Catálogo real: tabla `restaurants` con RLS de solo lectura. Precios no verificados van vacíos; el filtro de presupuesto excluye precios sin confirmar (decisión de producto vigente).
- Cuentas reales únicas (rol Usuario): ningún panel de administración; el rol se muestra en el perfil. No hay escritura al catálogo desde la app.
- El acceso a la app exige sesión iniciada: la bienvenida y las pantallas de autenticación son públicas; el resto queda protegido.
- Solo Usaquén y Chapinero tienen datos: los estados vacíos por localidad son de primera clase.
- El modo social simulado no publica perfiles ni conecta personas reales.
- Los planes de la demo anterior se conservan en su almacenamiento original y se muestran como ficticios.

## Brand Commitments

- Nombre: Entre Bocados. Tagline: "Descubre, comparte y disfruta".
- Mascota: niño chef tierno (estilo kawaii chibi, gorro de chef, cuchara) — vinculante desde el mockup.
- Mundo visual: el mockup del usuario (Figura 1) es el contrato visual vinculante — crema cálido de fondo, rosa/magenta principal, violeta secundario, acentos naranja/verde/ámbar, tarjetas muy redondeadas con sombras suaves, chips pastel, botones píldora, tipografía redondeada y amable.
- Voz: español colombiano cálido y juguetón ("¡Es un Match!", "Girar ruleta", "Me encantan"), siempre honesto sobre lo simulado.

## Evidence on Hand

- Mockup aprobado por el usuario (Figura 1) con los módulos: bienvenida, preferencias, Modo Explorar, Modo Conectar, Dúo Sabores, Planes del Dúo, Modo Ruta (ruleta), Modo Grupal, Dúos disponibles, Chat y panel "Una app, muchas formas de disfrutarla".
- Catálogo semilla real en `supabase/001_catalog.sql` y `supabase/002_catalog_chapinero.sql` (Santa Costilla, Julia Pizzería, Abasto y candidatos de Chapinero).
- Diseño incumbente en `src/components/demo-ui.tsx` (crema/marrón minimalista): se reemplaza por el mundo del mockup; su lógica y honestidad se conservan.
- No hay fotografías autorizadas del catálogo (`image_url` va vacío): los reemplazos visuales deben ser ilustración propia, nunca fotos fingidas.

## Product Principles

1. Honestidad demo: lo simulado se nombra, lo real funciona; el encanto nunca justifica engañar.
2. El sabor es la marca: la UI debe abrir el apetito — color jugoso, movimiento tierno y apetitoso, nada frío.
3. Un dedo, una decisión: cada pantalla hace avanzar el plan con el mínimo esfuerzo (swipe, chips, un botón primario claro).
4. Bogotá primero: localidades reales, pesos (COP), horarios reales ("Vie. 5pm – 9pm").

## Accessibility & Inclusion

- Español como idioma único de la UI.
- Todo gesto tiene equivalente de botón y acción de accesibilidad (heredado del incumbente).
- Objetivos táctiles ≥48dp; contraste AA; estados vacíos y de error con recuperación clara (reintentar catálogo).
