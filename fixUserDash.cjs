const fs = require('fs');
let c = fs.readFileSync('src/views/UserDashboardView.tsx', 'utf8');

c = c.replace(
  'const { userProfile, setIsAuthenticated, setActiveTab, playTacticalSound, addNotification } = useCrisis();',
  'const { userProfile, setIsAuthenticated, setActiveTab, playTacticalSound, addNotification, addNewCivilianIncident } = useCrisis();\n  const [isSubmitting, setIsSubmitting] = useState(false);'
);

fs.writeFileSync('src/views/UserDashboardView.tsx', c);
console.log('Fixed UserDashboard exports');
