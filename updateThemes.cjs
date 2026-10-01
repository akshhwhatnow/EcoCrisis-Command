const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const newThemes = `:root {
    --bg-primary: #05080E;
    --bg-secondary: #0A0F17;
    --bg-tertiary: #101824;
    --bg-card: rgba(10, 15, 23, 0.85);
    --bg-card-hover: rgba(16, 24, 36, 0.95);
    --border-color: rgba(255, 255, 255, 0.12);
    --border-highlight: rgba(255, 255, 255, 0.25);
    --text-primary: #FFFFFF;
    --text-secondary: #E2E8F0;
    --text-muted: #94A3B8;
    
    /* Semantic Emergency Palette - Bright Neon for Dark Theme */
    --accent: #38BDF8;
    --accent-glow: rgba(56, 189, 248, 0.25);
    --critical: #F87171;
    --critical-surface: rgba(248, 113, 113, 0.15);
    --warning: #FBBF24;
    --warning-surface: rgba(251, 191, 36, 0.15);
    --success: #34D399;
    --success-surface: rgba(52, 211, 153, 0.15);
    --info: #60A5FA;
    --wildlife: #C084FC;
    --agriculture: #34D399;
    --evacuation: #22D3EE;

    /* Shadow Hierarchy */
    --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.5);
    --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.6);
    --shadow-panel: 0 12px 40px rgba(0, 0, 0, 0.8);
  }

  .light {
    --bg-primary: #E2E8F0;
    --bg-secondary: #F8FAFC;
    --bg-tertiary: #CBD5E1;
    --bg-card: rgba(248, 250, 252, 0.92);
    --bg-card-hover: #FFFFFF;
    --border-color: rgba(0, 0, 0, 0.15);
    --border-highlight: rgba(0, 0, 0, 0.3);
    --text-primary: #020617;
    --text-secondary: #1E293B;
    --text-muted: #475569;

    /* Light Semantic Palette - Deep Solid Colors for Light Theme */
    --accent: #0369A1;
    --accent-glow: rgba(3, 105, 161, 0.15);
    --critical: #991B1B;
    --critical-surface: rgba(153, 27, 27, 0.12);
    --warning: #B45309;
    --warning-surface: rgba(180, 83, 9, 0.12);
    --success: #065F46;
    --success-surface: rgba(6, 95, 70, 0.12);
    --info: #1D4ED8;
    --wildlife: #6B21A8;
    --agriculture: #065F46;
    --evacuation: #0E7490;

    --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.15);
    --shadow-panel: 0 12px 40px rgba(0, 0, 0, 0.2);
  }`;

const oldThemesRegex = /:root\s*\{[\s\S]*?\}\s*\.light\s*\{[\s\S]*?\}/;
c = c.replace(oldThemesRegex, newThemes);

fs.writeFileSync('src/index.css', c);
console.log('Fixed themes');
