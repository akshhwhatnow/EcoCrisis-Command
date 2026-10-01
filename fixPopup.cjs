const fs = require('fs');

let c = fs.readFileSync('src/components/map/mapInteractions.ts', 'utf8');

const popupHtmlReplacement = `
    const popupHtml = \`
      <div style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.4; width: 240px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: 800; font-size: 14px; color: \${props.severity === 'Critical' ? '#ef4444' : '#f97316'}; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 16px;">\${props.icon}</span> \${props.name}
          </span>
        </div>
        <div style="color: \${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 2px;">
          <strong>Type:</strong> \${props.type}
        </div>
        <div style="color: \${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 2px;">
          <strong>Location:</strong> \${props.locationName}
        </div>
        <div style="color: \${isDark ? '#9ca3af' : '#4b5563'}; font-size: 11px; margin-bottom: 8px;">
          <strong>Reported:</strong> \${props.reportedAt || 'Just now'}
        </div>
        
        <div style="background: \${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Severity:</span>
            <strong style="color: \${props.severity === 'Critical' ? '#ef4444' : '#f97316'};">\${props.severity}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">People at Risk:</span>
            <strong>\${Number(props.peopleAtRisk).toLocaleString()}</strong>
          </div>
          \${props.livestockCount > 0 ? \`
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Livestock:</span>
            <strong style="color: #10b981;">\${props.livestockCount} head</strong>
          </div>\` : ''}
          <div style="display: flex; justify-content: space-between;">
            <span style="color: \${isDark ? '#9ca3af' : '#6b7280'};">Road Status:</span>
            <strong>\${props.roadStatus}</strong>
          </div>
        </div>
        <div style="font-size: 11px; color: \${isDark ? '#cbd5e1' : '#334155'}; font-style: italic;">
          \${props.description || 'No description provided.'}
        </div>
      </div>
    \`;
`;

// Replace the first popupHtml assignment (the one for incidents-inner)
const parts = c.split('const popupHtml = `');
c = parts[0] + popupHtmlReplacement.split('const popupHtml = `')[1] + parts[1].split('`;')[1];

fs.writeFileSync('src/components/map/mapInteractions.ts', c);
console.log('Updated popup!');
