const fs = require('fs');
let c = fs.readFileSync('src/components/map/CrisisMap.tsx', 'utf8');
c = c.replace("import maplibregl from 'maplibre-gl';", "import { Marker, Popup } from 'maplibre-gl';");
c = c.replace(/new maplibregl\.Marker/g, 'new Marker');
c = c.replace(/new maplibregl\.Popup/g, 'new Popup');
c = c.replace(/maplibregl\.Marker/g, 'Marker');
c = c.replace(/maplibregl\.Popup/g, 'Popup');
fs.writeFileSync('src/components/map/CrisisMap.tsx', c);
console.log('Fixed imports!');
