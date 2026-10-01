const fs = require('fs');

function fix(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');

  // Fix imports
  if (!c.includes('Sun, Moon')) {
    c = c.replace(
      "import { Mail,",
      "import { Mail, Sun, Moon,"
    );
  }

  // Fix destructuring
  if (!c.includes('toggleTheme')) {
    c = c.replace(
      "const { setActiveTab, playTacticalSound",
      "const { setActiveTab, playTacticalSound, theme, toggleTheme"
    );
  }

  fs.writeFileSync(filepath, c);
}

fix('src/views/LoginView.tsx');
fix('src/views/RegisterView.tsx');
console.log('Fixed Auth pages');
