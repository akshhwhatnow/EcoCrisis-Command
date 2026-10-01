const fs = require('fs');
let c = fs.readFileSync('src/components/map/mapInteractions.ts', 'utf8');

const splitPoint = '<span style="color: ${isDark ? \'#9ca3af\' : \'#6b7280\'};">Road Status:</span>';

if (c.includes(splitPoint)) {
  const parts = c.split(splitPoint);
  const newInsert = `\${props.cropHectares > 0 ? \`
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Crops/Agriculture:</span>
              <strong style="color: #f59e0b;">\${props.cropHectares} ha</strong>
            </div>\` : ''}
            \${props.habitatAreaKm2 > 0 ? \`
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Wildlife Habitat:</span>
              <strong style="color: #a855f7;">\${props.habitatAreaKm2} km²</strong>
            </div>\` : ''}
              `;
  c = parts[0] + newInsert + splitPoint + parts[1];
  fs.writeFileSync('src/components/map/mapInteractions.ts', c);
  console.log('Fixed popups successfully.');
} else {
  console.log('Split point not found.');
}
