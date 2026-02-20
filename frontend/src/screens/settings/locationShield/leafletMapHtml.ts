type Zone = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
};

export function buildLeafletMapHtml(
  location: { latitude: number; longitude: number } | null,
  zones: Zone[],
  draftCenter: { latitude: number; longitude: number } | null,
  draftRadius: number
): string {
  const points: [number, number][] = [];
  if (location) points.push([location.latitude, location.longitude]);
  zones.forEach((z) => points.push([z.latitude, z.longitude]));
  if (draftCenter) points.push([draftCenter.latitude, draftCenter.longitude]);
  const center = points.length
    ? points.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]).map((s, i) => s / points.length)
    : [25.241, 86.985];

  const zonesJson = JSON.stringify(zones);
  const locationJson = location ? JSON.stringify([location.latitude, location.longitude]) : 'null';
  const draftJson = draftCenter
    ? JSON.stringify({ lat: draftCenter.latitude, lon: draftCenter.longitude, radius: draftRadius })
    : 'null';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100%; min-height: 200px; }
    .leaflet-marker-icon.you { filter: hue-rotate(180deg); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var locationCoords = ${locationJson};
    var zones = ${zonesJson};
    var draft = ${draftJson};
    var center = ${JSON.stringify(center)};

    var map = L.map('map').setView(center, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var bounds = [];

    var youMarker = null;
    if (locationCoords) {
      youMarker = L.marker([locationCoords[0], locationCoords[1]])
        .addTo(map)
        .bindPopup('You are here');
      youMarker._icon && youMarker._icon.classList.add('you');
      bounds.push([locationCoords[0], locationCoords[1]]);
    }
    window.updateUserLocation = function(lat, lng) {
      if (youMarker) youMarker.setLatLng([lat, lng]);
    };

    zones.forEach(function(z) {
      var m = L.marker([z.latitude, z.longitude], { icon: L.divIcon({
        className: 'red-marker',
        html: '<div style="width:24px;height:24px;background:#E53935;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })}).addTo(map).bindPopup(z.name || 'Risk Zone');
      bounds.push([z.latitude, z.longitude]);
      L.circle([z.latitude, z.longitude], { radius: z.radius, color: '#E53935', fillColor: '#E53935', fillOpacity: 0.2, weight: 2 }).addTo(map);
    });

    if (draft) {
      var draftMarker = L.marker([draft.lat, draft.lon], {
        icon: L.divIcon({
          className: 'red-marker',
          html: '<div style="width:24px;height:24px;background:#E53935;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        }),
        draggable: true
      }).addTo(map).bindPopup('New zone');
      bounds.push([draft.lat, draft.lon]);
      var draftCircle = L.circle([draft.lat, draft.lon], { radius: draft.radius, color: '#E53935', fillColor: '#E53935', fillOpacity: 0.15, weight: 2, dashArray: '5,5' }).addTo(map);
      draftMarker.on('dragend', function(e) {
        var ll = e.target.getLatLng();
        draftCircle.setLatLng(ll);
        var msg = JSON.stringify({ type: 'draftMove', lat: ll.lat, lng: ll.lng });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else if (window.parent) window.parent.postMessage(msg, '*');
      });
    }

    map.setView(center, 15);
  </script>
</body>
</html>`;
}
