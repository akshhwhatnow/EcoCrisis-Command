const fs = require('fs');

let c = fs.readFileSync('src/views/LandingView.tsx', 'utf8');
c = c.replace('<div className="page-transition min-h-screen', '<div className="min-h-screen');
fs.writeFileSync('src/views/LandingView.tsx', c);

console.log('Removed animation from LandingView');
