const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const oldAnimations = `@keyframes pageEnter {
    0% {
      opacity: 0;
      transform: scale(0.97);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .page-transition {
    animation: pageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }`;

const newAnimations = `@keyframes pageEnter {
    0% {
      opacity: 0;
      transform: scale(0.94);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .page-transition {
    transform-origin: center center;
    animation: pageEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }`;

c = c.replace(oldAnimations, newAnimations);
fs.writeFileSync('src/index.css', c);
console.log('Updated CSS transitions');
