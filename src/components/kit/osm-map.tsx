import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { Coords, Restaurant } from '../../types/restaurant';
import { Colors } from '../../constants/theme';

/**
 * Mapa OpenStreetMap (tiles libres, sin clave) renderizado con Leaflet,
 * vestido con el mundo de la marca: tiles cálidos Voyager, pines pastelería
 * y popup con la tipografía de Entre Bocados. En Android/iOS va dentro de un
 * WebView; en web, un iframe con el mismo HTML. Sin controles de zoom (+/-):
 * el gesto nativo (pellizco, doble toque) manda.
 */

type MapProps = {
  places: Restaurant[];
  user: Coords;
  radiusKm: number;
  /** false oculta el círculo de radio (p. ej. para un solo lugar). */
  showRadius?: boolean;
};

function escapeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '').replace(/\u2029/g, '');
}

function buildHtml({ places, user, radiusKm, showRadius = true }: MapProps): string {
  const markers = places
    .filter(place => place.geo)
    .slice(0, 20)
    .map(place => ({
      lat: place.geo!.latitude,
      lng: place.geo!.longitude,
      name: place.name,
      line: [
        place.cuisine,
        place.distance_km != null ? `a ${place.distance_km} km` : null,
        place.rating != null ? `${place.rating} (${place.rating_count ?? 0} reseñas)` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }));

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Nunito:wght@600;800&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body{height:100%;margin:0;padding:0;background:${Colors.cream};-webkit-tap-highlight-color:transparent;user-select:none}
#map{height:100%;width:100%}
.leaflet-container{font-family:'Nunito',-apple-system,'Segoe UI',Roboto,sans-serif;background:${Colors.cream}}
.leaflet-tile-pane{filter:sepia(0.12) saturate(0.92) brightness(1.02)}
/* pin pastelería: gota rosa con centro blanco */
.pinwrap{width:28px;height:28px}
.pin{position:absolute;left:4px;top:4px;width:20px;height:20px;background:${Colors.pinkFill};border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 7px rgba(64,31,51,0.35)}
.pin::after{content:'';position:absolute;left:50%;top:50%;width:6px;height:6px;background:#fff;border-radius:50%;transform:translate(-50%,-50%)}
/* tu posición: punto verde que respira */
.mewrap{width:22px;height:22px}
.me{position:absolute;left:1px;top:1px;width:14px;height:14px;background:${Colors.green};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 5px rgba(64,31,51,0.35);animation:mebeat 1.8s ease-in-out infinite}
@keyframes mebeat{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}
/* popup de la marca: tarjeta blanca 14 con Baloo 2 en el nombre */
.leaflet-popup-content-wrapper{border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(64,31,51,0.18)}
.leaflet-popup-content{font-family:'Nunito',-apple-system,'Segoe UI',Roboto,sans-serif;font-weight:600;font-size:12.5px;line-height:1.4;margin:10px 13px;color:${Colors.inkSoft}}
.leaflet-popup-content b{font-family:'Baloo 2','Nunito',sans-serif;font-weight:700;font-size:14.5px;color:${Colors.ink};display:block;margin-bottom:2px}
.leaflet-popup-close-button{color:${Colors.inkSoft}}
.leaflet-control-attribution{font-size:9px;color:${Colors.inkSoft};background:rgba(255,255,255,0.8);border-radius:8px 0 0 0;padding:1px 5px}
.leaflet-control-attribution a{color:${Colors.inkSoft}}
</style></head><body>
<div id="map"></div>
<script>
var user = ${escapeJson([user.latitude, user.longitude])};
var radius = ${escapeJson(radiusKm * 1000)};
var MARKERS = ${escapeJson(markers)};
var map = L.map('map', { attributionControl: true, zoomControl: false });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; Colaboradores de OpenStreetMap'
}).addTo(map);
L.marker(user, { icon: L.divIcon({ className: '', html: '<div class="mewrap"><div class="me"></div></div>', iconSize: [22, 22], iconAnchor: [11, 11] }) })
  .addTo(map).bindPopup('<b>Estás aquí</b>');
${showRadius ? `L.circle(user, { radius: radius, color: '${Colors.greenDeep}', weight: 1.6, fillColor: '${Colors.green}', fillOpacity: 0.08, dashArray: '6 6' }).addTo(map);` : ''}
var pts = [user];
MARKERS.forEach(function (m) {
  L.marker([m.lat, m.lng], { icon: L.divIcon({ className: '', html: '<div class="pinwrap"><div class="pin"></div></div>', iconSize: [28, 28], iconAnchor: [14, 27] }) })
    .addTo(map)
    .bindPopup('<b>' + m.name + '</b>' + m.line);
  pts.push([m.lat, m.lng]);
});
map.fitBounds(L.latLngBounds(pts).pad(0.3), { animate: false });
</script></body></html>`;
}

export function OsmMap({ places, user, radiusKm, showRadius }: MapProps) {
  const html = useMemo(() => buildHtml({ places, user, radiusKm, showRadius }), [places, user, radiusKm, showRadius]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.webWrap]}>
        <iframe
          srcDoc={html}
          title="Mapa de la ronda"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 18 }}
        />
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityLabel="Mapa con los lugares cerca de ti"
      accessibilityRole="image"
    >
      <WebView source={{ html }} style={StyleSheet.absoluteFill} setSupportMultipleWindows={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.creamDeep },
  webWrap: { overflow: 'hidden' },
});
