const fs = require('fs');

function addTransition(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');
  c = c.replace(
    /<div className="min-h-screen /,
    '<div className="page-transition min-h-screen '
  );
  fs.writeFileSync(filepath, c);
}

addTransition('src/views/LandingView.tsx');
addTransition('src/views/LoginView.tsx');
addTransition('src/views/RegisterView.tsx');
console.log('Added page-transition class');
