# Entre Bocados

Demo Android con Expo, React Native y TypeScript. El catálogo de Usaquén se consulta mediante la Data API de Supabase. Registro, acceso, recuperación y perfil son simulados: no se crean cuentas ni se solicitan correos o contraseñas. Favoritos, alias y preferencias se guardan únicamente en el dispositivo. El modo social, los matches y los planes siguen siendo ficticios: no crean reservas ni vinculan usuarios.

## Preparar Supabase

1. Crea un proyecto y habilita Data API.
2. En **SQL Editor**, ejecuta una vez `supabase/001_catalog.sql`. El script crea la tabla, habilita RLS, concede solo lectura pública a restaurantes publicados e inserta tres candidatos. No ejecutes el script sobre una tabla existente sin revisar su contenido.
3. Si tu configuración no expone automáticamente la tabla, habilita la exposición de `restaurants` en **Integrations > Data API**. No desactives RLS.
4. En **Table Editor > restaurants** revisa datos y carga más establecimientos. Los precios no verificados deben permanecer vacíos; usa fotos únicamente con permiso. Precios, enlaces y sedes pueden cambiar.

Fuentes: [Santa Costilla Usaquén](https://santacostilla.co/reservas/usaquen/), [Julia Pizzería](https://juliapizzeria.com/) y [Abasto](https://abasto.com.co/). Revisadas el 14 de noviembre de 2026. Los enlaces a mapas de Julia y Abasto son búsquedas por dirección y deben comprobarse antes de la presentación.

## Configuración local

Requiere Node.js 22.13 o superior y una versión de Expo Go compatible con SDK 57. Crea `.env.local` junto a `package.json`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

También se acepta `EXPO_PUBLIC_SUPABASE_KEY` para la clave publicable. Las variables `EXPO_PUBLIC_` se incluyen en la aplicación: no pongas contraseñas, cadenas PostgreSQL ni claves secretas o `service_role`. El archivo `.env.local` está excluido de Git.

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
```

## APK

`eas.json` incluye un perfil `preview` para generar APK. Configura la URL y la clave publicable en el entorno de Expo Services que utilice la compilación: `.env.local` está ignorado y no se debe asumir que se subirá. Se requiere acceso al proyecto Expo configurado en `app.json`. Después, ejecuta:

```sh
npx eas-cli@latest build --platform android --profile preview
```
