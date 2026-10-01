const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

if (!c.includes('overflow-y: scroll;')) {
  c = c.replace(
    'body {',
    'html {\n    overflow-y: scroll;\n  }\n\n  body {'
  );
  fs.writeFileSync('src/index.css', c);
  console.log('Added overflow-y: scroll to html');
}
