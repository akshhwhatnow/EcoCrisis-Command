const fs = require('fs');
let c = fs.readFileSync('src/views/LandingView.tsx', 'utf8');

// Add Sun/Moon imports if not present
if (!c.includes('Sun,')) {
  c = c.replace(
    "Globe,",
    "Globe, Sun, Moon,"
  );
}

// Extract theme state and toggle function
c = c.replace(
  "const { setActiveTab, playTacticalSound } = useCrisis();",
  "const { setActiveTab, playTacticalSound, theme, toggleTheme } = useCrisis();"
);

// Add the toggle button in the header nav section
const oldHeaderRight = `        <div className="flex items-center gap-4">
          <button
            onClick={handleOperatorLogin}`;

const newHeaderRight = `        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playTacticalSound('click');
              toggleTheme();
            }}
            className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors cursor-pointer flex items-center justify-center shadow-subtle group"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-sky-500 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
          
          <button
            onClick={handleOperatorLogin}`;

c = c.replace(oldHeaderRight, newHeaderRight);

// Replace hardcoded backgrounds
c = c.replace(/bg-\[\#070b12\]/g, 'bg-[var(--bg-primary)]');
c = c.replace(/bg-\[\#090e17\]/g, 'bg-[var(--bg-secondary)]');
c = c.replace(/bg-\[\#0d131c\]/g, 'bg-[var(--bg-card)]');
c = c.replace(/border-white\/15/g, 'border-[var(--border-color)]');
c = c.replace(/text-white\/40/g, 'text-[var(--text-muted)]');
c = c.replace(/text-white\/60/g, 'text-[var(--text-secondary)]');
c = c.replace(/hover:text-white/g, 'hover:text-[var(--text-primary)]');

fs.writeFileSync('src/views/LandingView.tsx', c);
console.log('Patched LandingView.tsx');
