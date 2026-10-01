const fs = require('fs');
let c = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');
c = c.replace(/heightClass="h-\[600px\] w-full"/g, 'heightClass="h-[400px] lg:h-[600px] w-full"');
fs.writeFileSync('src/views/DashboardView.tsx', c);
