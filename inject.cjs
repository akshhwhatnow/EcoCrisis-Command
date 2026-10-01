const fs = require('fs');
let c = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

c = c.replace(
  '<CrisisMap heightClass="h-[600px] w-full" showLayerControls={true} interactive={true} />',
  '<CrisisMap heightClass="h-[600px] w-full" showLayerControls={true} interactive={true} />\n            <OmnichannelSimulator />'
);

fs.writeFileSync('src/views/DashboardView.tsx', c);
console.log('Replaced successfully.');
