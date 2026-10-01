const fs = require('fs');

function fix(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');

  // Fix destructuring safely
  c = c.replace(
    /\} = useCrisis\(\);/,
    ", theme, toggleTheme } = useCrisis();"
  );
  
  // Clean up duplicates if any
  c = c.replace(/, theme, toggleTheme, theme, toggleTheme/g, ", theme, toggleTheme");

  fs.writeFileSync(filepath, c);
}

fix('src/views/LoginView.tsx');
fix('src/views/RegisterView.tsx');
console.log('Fixed Auth pages properly');
