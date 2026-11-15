# Entre Bocados

Prototipo móvil de demostración con Expo, React Native y TypeScript. Restaurantes, acompañante y coincidencias son ficticios; los planes se guardan solo en el dispositivo y no son reservas.

## Iniciar

Requiere Node.js 22.13 o superior y Expo Go compatible con SDK 57.

```sh
npm ci
npx expo start
```

Escanea el QR con Expo Go. Elige cualquier filtro, deja pasar o aprueba **Casa Tomillo**, **Patio Criollo** o **La Esquina** para ver un match. Guarda el plan y consúltalo en Planes. Perfil permite reiniciar la demo.

```sh
npm run lint
npx tsc --noEmit
npx expo-doctor
```

Las imágenes remotas requieren conexión. La demo no conecta con Supabase, ni crea cuentas o coincidencias reales.
