const fs = require('fs');

function patchAuthView(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');

  // Add Sun/Moon imports if not present
  if (!c.includes('Sun,')) {
    c = c.replace(
      "import { Shield, ShieldAlert,",
      "import { Shield, ShieldAlert, Sun, Moon,"
    );
  }

  // Extract theme state and toggle function
  c = c.replace(
    "const { setActiveTab, setIsAuthenticated, setCurrentUserRole, playTacticalSound } = useCrisis();",
    "const { setActiveTab, setIsAuthenticated, setCurrentUserRole, playTacticalSound, theme, toggleTheme } = useCrisis();"
  );

  // For RegisterView, the destructuring is slightly different:
  c = c.replace(
    "const { setActiveTab, playTacticalSound } = useCrisis();",
    "const { setActiveTab, playTacticalSound, theme, toggleTheme } = useCrisis();"
  );

  // Add the toggle button in the top right absolute positioned
  const toggleBtn = `
      <button
        onClick={() => {
          playTacticalSound('click');
          toggleTheme();
        }}
        className="absolute top-6 right-6 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors cursor-pointer flex items-center justify-center shadow-subtle group z-50"
        title="Toggle Light/Dark Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 text-sky-500 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>
  `;

  // Insert after the first div
  c = c.replace(
    /<div className="min-h-screen .*?">/,
    match => match + toggleBtn
  );

  // Replace hardcoded backgrounds
  c = c.replace(/bg-\[\#070b12\]/g, 'bg-[var(--bg-primary)]');
  c = c.replace(/bg-\[\#0b101a\]/g, 'bg-[var(--bg-card)]');
  c = c.replace(/border-white\/10/g, 'border-[var(--border-color)]');
  c = c.replace(/text-white\/40/g, 'text-[var(--text-muted)]');
  c = c.replace(/text-white\/60/g, 'text-[var(--text-secondary)]');

  fs.writeFileSync(filepath, c);
}

patchAuthView('src/views/LoginView.tsx');
patchAuthView('src/views/RegisterView.tsx');
console.log('Patched auth views');
