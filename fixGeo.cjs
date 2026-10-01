const fs = require('fs');

let c = fs.readFileSync('src/components/map/mapGeoJson.ts', 'utf8');
const before = c.split('roadStatus: inc.accessibility.status')[0];
const after = c.split('export function buildResourcesGeoJson')[1];

const replacement = `roadStatus: inc.accessibility.status,
          description: inc.description,
          reportedAt: inc.reportedAt,
          icon: inc.type.toLowerCase().includes('fire') || inc.type.toLowerCase().includes('wildfire') ? '🔥' :
                inc.type.toLowerCase().includes('flood') || inc.type.toLowerCase().includes('water') ? '🌊' :
                inc.type.toLowerCase().includes('storm') || inc.type.toLowerCase().includes('cyclone') ? '🌪️' :
                inc.type.toLowerCase().includes('volcan') ? '🌋' :
                inc.type.toLowerCase().includes('radiation') || inc.type.toLowerCase().includes('chemical') || inc.type.toLowerCase().includes('industrial') ? '☢️' :
                inc.type.toLowerCase().includes('medical') ? '🏥' :
                inc.type.toLowerCase().includes('heat') ? '🌡️' :
                inc.type.toLowerCase().includes('struct') || inc.type.toLowerCase().includes('infrastructure') ? '🏚️' : '🚨',
        },
      })),
    };
}

export function buildResourcesGeoJson`;

fs.writeFileSync('src/components/map/mapGeoJson.ts', before + replacement + after);
console.log('Done!');
