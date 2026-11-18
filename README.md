# Entre Bocados

Aplicación móvil con Expo, React Native y TypeScript. El catálogo se consulta en Supabase. Las pantallas de demostración mantienen sus perfiles, preferencias y favoritos en el dispositivo. El piloto conectado de módulos 5 y 6 usa cuentas precreadas en Supabase Auth para sincronizar planes compartidos, chat privado y avisos dentro de la app; no admite registro, reservas ni notificaciones push.

## Probar módulos 5 y 6 sin conexión

Desde la bienvenida, toca **Probar planes y chat sin conexión**. También puedes entrar desde **Planes → Probar demo local**. Como Alex, crea el plan de Casa Tomillo, propone una fecha y envía un mensaje. Regresa a los planes y toca **Cambiar a Sofía** para abrir el aviso, responder y actualizar la fecha. También puedes cerrar el plan y consultar el historial en modo lectura.

La demo no necesita cuentas ni variables de entorno. Los cambios se guardan en este dispositivo; no son reservas ni se sincronizan. **Reiniciar demo local** borra solo este recorrido, no los planes conservados de la versión anterior. Para probar el modo avión, carga primero la aplicación o usa una compilación instalada.

## Preparar Supabase

1. Crea un proyecto y habilita Data API.
2. En **SQL Editor**, ejecuta una vez `supabase/001_catalog.sql`. El script crea la tabla, habilita RLS, concede solo lectura pública a restaurantes publicados e inserta tres candidatos. No ejecutes el script sobre una tabla existente sin revisar su contenido.
3. Si tu configuración no expone automáticamente la tabla, habilita la exposición de `restaurants` en **Integrations > Data API**. No desactives RLS.
4. En **Table Editor > restaurants** revisa datos y carga más establecimientos. Los precios no verificados deben permanecer vacíos; usa fotos únicamente con permiso. Precios, enlaces y sedes pueden cambiar.

## Piloto conectado: módulos 5 y 6

1. En **SQL Editor** del mismo proyecto que contiene `restaurants`, ejecuta `supabase/migrations/20261117122259_modules_5_6_shared_plans_chat.sql`. La migración agrega tablas con RLS, operaciones transaccionales para planes/chat/avisos y suscripciones Realtime; conserva el catálogo existente. No otorgues escritura directa a `anon` ni a `authenticated`.
   Si el REST API devuelve `PGRST205` para esas tablas después de la migración, revisa que el esquema `public` siga expuesto en **Integrations > Data API**; no desactives RLS ni amplíes permisos de escritura.
2. En **Authentication > Users**, crea dos cuentas de prueba para participantes y una tercera cuenta de control. El formulario piloto solo permite iniciar sesión; no crea usuarios ni recupera contraseñas.
3. Copia los UUID de los dos participantes desde Authentication y ejecuta en SQL Editor una coincidencia de prueba con un restaurante publicado:

   ```sql
   -- Sustituye ambos UUID por los usuarios creados en este proyecto.
   insert into public.matches (user_a, user_b, restaurant_id)
   values (
     '00000000-0000-4000-8000-000000000001'::uuid,
     '00000000-0000-4000-8000-000000000002'::uuid,
     'julia-usaquen'
   )
   on conflict do nothing;
   ```

   Esta inserción administrativa es temporal, hasta que el módulo Dúo Sabores escriba coincidencias verificadas. No habilites INSERT/UPDATE para los usuarios de la app. La tercera cuenta no debe aparecer en esa coincidencia ni acceder a sus planes, mensajes o avisos.
4. Abre **Planes > Iniciar sesión en el piloto**. Ambos participantes verán la misma coincidencia; cualquiera puede crear el plan, proponer fecha futura, conversar y finalizarlo. El acceso y los datos de esta área están separados de la demo local.

Fuentes: [Santa Costilla Usaquén](https://santacostilla.co/reservas/usaquen/), [Julia Pizzería](https://juliapizzeria.com/) y [Abasto](https://abasto.com.co/). Revisadas el 14 de noviembre de 2026. Los enlaces a mapas de Julia y Abasto son búsquedas por dirección y deben comprobarse antes de la presentación.

## Configuración local

Requiere Node.js 22.13 o superior y una versión de Expo Go compatible con SDK 57. Crea `.env.local` junto a `package.json`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

También se acepta `EXPO_PUBLIC_SUPABASE_KEY` para la clave publicable. Las variables `EXPO_PUBLIC_` se incluyen en la aplicación: no pongas contraseñas, cadenas PostgreSQL ni claves secretas o `service_role`. El archivo `.env.local` está excluido de Git. El proyecto conserva la URL y clave publicable solo localmente; para una compilación EAS, configura esos dos valores públicos en el entorno de compilación.

```sh
npm ci
npx expo start
```

Escanea el QR con Expo Go. Necesitas internet para el catálogo. Si falla la consulta, comprueba SQL, exposición de la tabla y configuración local. La app distingue errores de conexión de catálogos vacíos y permite reintentar.

Un filtro de presupuesto excluye restaurantes sin precio confirmado; por eso inicialmente puede no mostrar resultados. Los favoritos se guardan localmente y requieren conexión para consultar los detalles. Los planes de la demo anterior se conservan en su almacenamiento original y se muestran como ficticios.

Para agregar cuatro candidatos de Chapinero sin alterar los existentes, ejecuta `supabase/002_catalog_chapinero.sql` desde SQL Editor y actualiza el catálogo en la app. La selección incluye las 20 localidades, pero solo hay datos iniciales en Usaquén y Chapinero. Los gestos en Explorar son: izquierda para pasar, derecha para marcar interés y arriba para favoritos. El interés y los favoritos se guardan localmente.

Para volver a ver el registro o el acceso sin borrar los datos locales, abre **Perfil > Ver pantallas de acceso (demo)**. La recuperación de contraseña es solo una explicación y no envía correos.

```sh
npm run lint
npx tsc --noEmit
node --experimental-strip-types --test src/features/plans/*.test.js
```

## APK

`eas.json` incluye un perfil `preview` para generar APK. Configura la URL y la clave publicable en el entorno de Expo Services que utilice la compilación: `.env.local` está ignorado y no se debe asumir que se subirá. Se requiere acceso al proyecto Expo configurado en `app.json`. Después, ejecuta:

```sh
npx eas-cli@latest build --platform android --profile preview
```
