const fs = require('fs');
let c = fs.readFileSync('src/views/HumanApprovalView.tsx', 'utf8');

c = c.replace(
  /confetti\(\{[\s\S]*?\}\);/,
  "// Confetti removed as per user request"
);

fs.writeFileSync('src/views/HumanApprovalView.tsx', c);
console.log('Removed confetti');
