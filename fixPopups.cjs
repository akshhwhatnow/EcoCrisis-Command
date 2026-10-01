const fs = require('fs');
let c = fs.readFileSync('src/components/map/mapInteractions.ts', 'utf8');

c = c.replace(
  /\\$\\{props\\.livestockCount > 0 \\? \\`[\\s\\S]*?<\\/div>\\` : ''\\}/,
  `\${props.livestockCount > 0 ? \`
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Livestock:</span>
              <strong style="color: #10b981;">\${props.livestockCount} head</strong>
            </div>\` : ''}
            \${props.cropHectares > 0 ? \`
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Crops/Agriculture:</span>
              <strong style="color: #f59e0b;">\${props.cropHectares} ha</strong>
            </div>\` : ''}
            \${props.habitatAreaKm2 > 0 ? \`
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Wildlife Habitat:</span>
              <strong style="color: #a855f7;">\${props.habitatAreaKm2} km²</strong>
            </div>\` : ''}`
);

fs.writeFileSync('src/components/map/mapInteractions.ts', c);
