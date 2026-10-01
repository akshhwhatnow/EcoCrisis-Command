const fs = require('fs');

let login = fs.readFileSync('src/views/LoginView.tsx', 'utf8');
login = login.replace(/http:\/\/localhost:3001\/api\/auth\/login/g, '/api/auth/login');
fs.writeFileSync('src/views/LoginView.tsx', login);

let register = fs.readFileSync('src/views/RegisterView.tsx', 'utf8');
register = register.replace(/http:\/\/localhost:3001\/api\/auth\/register/g, '/api/auth/register');
fs.writeFileSync('src/views/RegisterView.tsx', register);

console.log('Fixed hardcoded localhost paths.');
