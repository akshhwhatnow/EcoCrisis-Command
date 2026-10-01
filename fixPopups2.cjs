const fs = require('fs');
let c = fs.readFileSync('src/components/map/mapInteractions.ts', 'utf8');

const targetStr = "${props.livestockCount > 0 ? `\n            <div style=\"display: flex; justify-content: space-between; margin-bottom: 3px;\">\n              <span style=\"color: ${isDark ? '#9ca3af' : '#6b7280'}\">Livestock:</span>\n              <strong style=\"color: #10b981;\">${props.livestockCount} head</strong>\n            </div>` : ''}";

const replacement = `\${props.livestockCount > 0 ? \`
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
            </div>\` : ''}`;

c = c.replace(targetStr, replacement);
fs.writeFileSync('src/components/map/mapInteractions.ts', c);
