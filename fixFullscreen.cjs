const fs = require('fs');

let c = fs.readFileSync('src/components/map/CrisisMap.tsx', 'utf8');

// 1. Add Minimize to imports
c = c.replace('Maximize2,', 'Maximize2,\n  Minimize,');

// 2. Remove FullscreenControl from MapLibre
c = c.replace(/map\.addControl\(new FullscreenControl\(\), 'top-right'\);/, '');

// 3. Add wrapperRef and fullscreen logic
const logicToAdd = `
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
`;

c = c.replace('const mapContainerRef = useRef<HTMLDivElement>(null);', 'const mapContainerRef = useRef<HTMLDivElement>(null);' + logicToAdd);

// 4. Update wrapper div
c = c.replace(
  '<div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#070b12] select-none shadow-panel`}>',
  '<div ref={wrapperRef} className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#070b12] select-none shadow-panel ${isFullscreen ? "h-screen" : ""}`}>'
);

// 5. Add Fullscreen button to the custom controls
const btnToAdd = `
        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
`;

c = c.replace(
  '<button onClick={handleZoomOut}',
  btnToAdd + '\n        <button onClick={handleZoomOut}'
);

fs.writeFileSync('src/components/map/CrisisMap.tsx', c);
console.log('Added custom fullscreen logic!');
