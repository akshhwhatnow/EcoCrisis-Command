const fs = require('fs');

let c = fs.readFileSync('src/components/map/CrisisMap.tsx', 'utf8');

// 1. Remove standard NavigationControl
c = c.replace(/map\.addControl\(new NavigationControl[\s\S]*?'top-right'\);/, '');

// 2. Add imports
const importsToAdd = `import { Plus, Minus, Search as SearchIcon, X, MapPin, Loader2 } from 'lucide-react';
import maplibregl from 'maplibre-gl';
`;
c = c.replace("import {", importsToAdd + "\nimport {");

// 3. Add states for search inside the component
const statesToAdd = `
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);
  const searchPopupRef = useRef<maplibregl.Popup | null>(null);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomIn({ duration: 300 });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomOut({ duration: 300 });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);
    
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(searchQuery)}&limit=5\`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        if (data.length === 1) {
          selectSearchResult(data[0]);
        } else {
          setSearchResults(data);
          setShowSuggestions(true);
        }
      } else {
        setSearchError('Location not found. Try another search.');
      }
    } catch (err) {
      setSearchError('Search failed. Please check connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const map = mapRef.current;
    if (!map) return;
    
    setShowSuggestions(false);
    setSearchQuery(result.display_name.split(',')[0]);
    
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      essential: true
    });
    
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    if (searchPopupRef.current) {
      searchPopupRef.current.remove();
    }
    
    searchPopupRef.current = new maplibregl.Popup({ offset: 25 })
      .setHTML(\`<div style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: bold; color: #1e293b;">\${result.display_name}</div>\`);
      
    searchMarkerRef.current = new maplibregl.Marker({ color: '#ec4899' })
      .setLngLat([lng, lat])
      .setPopup(searchPopupRef.current)
      .addTo(map);
      
    searchMarkerRef.current.togglePopup();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setSearchError(null);
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    if (searchPopupRef.current) {
      searchPopupRef.current.remove();
      searchPopupRef.current = null;
    }
  };
`;

c = c.replace(/const toggleLayer = /g, statesToAdd + '\n  const toggleLayer = ');

// 4. Add UI elements
const uiToAdd = `
      {/* Search Bar Overlay */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative w-full flex items-center bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-highlight)] rounded-2xl shadow-panel overflow-hidden">
          <button type="submit" className="p-3 text-[var(--text-muted)] hover:text-sky-500 transition-colors cursor-pointer">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> : <SearchIcon className="w-5 h-5" />}
          </button>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            placeholder="Search for a location..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] py-3"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="p-3 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
        
        {/* Search Error */}
        {searchError && (
          <div className="mt-2 w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold shadow-panel text-center">
            {searchError}
          </div>
        )}
        
        {/* Search Suggestions */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="mt-2 w-full max-h-64 overflow-y-auto rounded-xl bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-highlight)] shadow-panel flex flex-col">
            {searchResults.map((res, i) => (
              <button 
                key={i} 
                onClick={() => selectSearchResult(res)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span className="text-xs text-[var(--text-primary)] leading-relaxed">{res.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Zoom Controls */}
      <div className="absolute bottom-6 right-3 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] flex items-center justify-center shadow-panel transition-all cursor-pointer">
          <Minus className="w-5 h-5" />
        </button>
      </div>
`;

c = c.replace(/\{showLayerControls && mapLoaded && \(/, uiToAdd + '\n      {showLayerControls && mapLoaded && (');

fs.writeFileSync('src/components/map/CrisisMap.tsx', c);
console.log('CrisisMap updated with Search and Zoom!');
