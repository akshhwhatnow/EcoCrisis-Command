const fs = require('fs');
let c = fs.readFileSync('src/views/LandingView.tsx', 'utf8');

// 1. Change handleEnterCommandCenter to set active tab to 'login'
c = c.replace(
  "setActiveTab('dashboard');",
  "setActiveTab('login');"
);

// 2. Add scrollToSection helper
const newScroll = `
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
`;
c = c.replace(
  "const handleEnterCommandCenter = () => {",
  newScroll + "\n  const handleEnterCommandCenter = () => {"
);

// 3. Update the a tags in nav
const oldNav = `<nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-muted)]">
          <a href="#pillars" className="hover:text-[var(--text-primary)] transition-colors">Cross-Sector Pillars</a>
          <a href="#architecture" className="hover:text-[var(--text-primary)] transition-colors">8-Agent Architecture</a>
          <a href="#governance" className="hover:text-[var(--text-primary)] transition-colors">Human Governance</a>
        </nav>`;
const newNav = `<nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-muted)]">
          <a href="#pillars" onClick={(e) => scrollToSection(e, 'pillars')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Cross-Sector Pillars</a>
          <a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">8-Agent Architecture</a>
          <a href="#governance" onClick={(e) => scrollToSection(e, 'governance')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Human Governance</a>
        </nav>`;
c = c.replace(oldNav, newNav);

fs.writeFileSync('src/views/LandingView.tsx', c);
console.log('Fixed LandingView nav and login redirect');
