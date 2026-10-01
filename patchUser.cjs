const fs = require('fs');
let c = fs.readFileSync('src/views/UserDashboardView.tsx', 'utf8');

c = c.replace(
  'const { userProfile, addNotification } = useCrisis();',
  'const { userProfile, addNotification, addNewCivilianIncident } = useCrisis();\n  const [isSubmitting, setIsSubmitting] = useState(false);'
);

c = c.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';"
);

// We need to rewrite handleReportSubmit
const oldSubmit = `  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    // Add the notification to the admin side via context
    addNotification(
      \`Civilian Report to \${selectedAgency}\`,
      \`Location: \${locationDetails || 'Unknown'} - \${description}\`,
      'critical'
    );
    
    // Clear form and alert user
    setLocationDetails('');
    setDescription('');
    alert(\`Incident report successfully sent to \${selectedAgency}!\`);
  };`;

const newSubmit = `  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !locationDetails) {
      alert("Please provide both location and description.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Geocode the location using Nominatim
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?q=\${encodeURIComponent(locationDetails)}&format=json&limit=1\`);
      const data = await res.json();
      
      let lat = 14.845; // Default fallback to MVP region (Philippines)
      let lng = 121.215;
      
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      } else {
        console.warn("Geocoding failed, using fallback coordinates.");
      }
      
      addNewCivilianIncident(selectedAgency, description, locationDetails, lat, lng);
      
      setLocationDetails('');
      setDescription('');
      alert(\`Incident report successfully sent to \${selectedAgency}!\`);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to send report. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

c = c.replace(oldSubmit, newSubmit);

// Also change the button text to show loading
c = c.replace(
  "Submit Emergency Report",
  "{isSubmitting ? 'Geocoding & Sending...' : 'Submit Emergency Report'}"
);

c = c.replace(
  "<button type=\"submit\" className=\"w-full py-3",
  "<button type=\"submit\" disabled={isSubmitting} className=\"w-full py-3 disabled:opacity-50"
);

fs.writeFileSync('src/views/UserDashboardView.tsx', c);
console.log('Patched UserDashboardView.tsx');
