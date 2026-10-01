const fs = require('fs');
let c = fs.readFileSync('src/views/LandingView.tsx', 'utf8');

if (!c.includes('window.scrollTo(0, 0)')) {
  const oldFn = `export const LandingView: React.FC = () => {\n  const { setActiveTab`;
  const newFn = `export const LandingView: React.FC = () => {\n  React.useEffect(() => {\n    window.scrollTo(0, 0);\n    if (window.location.hash) {\n      window.history.replaceState(null, '', window.location.pathname);\n    }\n  }, []);\n\n  const { setActiveTab`;
  
  c = c.replace(oldFn, newFn);
  fs.writeFileSync('src/views/LandingView.tsx', c);
  console.log('Added scrollTo(0,0) on mount');
}
