const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('ECO-Crisis_Command_Pitch.pdf'));

doc.fontSize(24).font('Helvetica-Bold').text('ECO-Crisis Command: Hackathon Pitch Script', { align: 'center' });
doc.moveDown(1.5);

doc.fontSize(18).text('1. The Hook (Introduction)');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('Hello judges! Have you ever wondered what happens during a massive natural disaster when phone lines are jammed, human dispatchers are overwhelmed, and every second counts?');
doc.moveDown(0.5);
doc.text('Our project, ECO-Crisis Command, solves this. It is a next-generation, AI-powered emergency management platform. It acts as a digital "brain" that connects civilians reporting disasters directly to autonomous AI agents that deploy resources instantly.');
doc.moveDown(1.5);

doc.fontSize(18).font('Helvetica-Bold').text('2. The Tech Stack (How it\'s built)');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('Before I show you the demo, here is a quick overview of our architecture:');
doc.list([
  'The Frontend is built using React and Tailwind CSS. It features a highly interactive, global WebGL map powered by MapLibre.',
  'The Backend runs on a Node.js and Express server, communicating in real-time.',
  'The Database is a secure PostgreSQL database that stores all historical incident data and user roles.'
], { bulletRadius: 3 });
doc.moveDown(1.5);

doc.fontSize(18).font('Helvetica-Bold').text('3. The Core Concept (Users vs. Admins)');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('Our platform has two main views:');
doc.moveDown(0.5);
doc.text('First, we have the Civilian User. If a civilian is caught in an emergency, they can open their dashboard and quickly submit an incident report—like a flood or a fire—and specify which agency needs to help.');
doc.moveDown(0.5);
doc.text('Second, we have the Admin Commander. The admin looks at our beautiful global map. On this map, we use universal emojis to instantly communicate disaster types—like a fire icon in Australia, or a radiation icon in Shanghai. This gives the commander a "God\'s-eye view" of the world.');
doc.moveDown(1.5);

doc.fontSize(18).font('Helvetica-Bold').text('4. The Live Demo (Action Steps)');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('(At this point, have two browser windows open side-by-side: one Admin, one User).', { oblique: true });
doc.moveDown(0.5);
doc.text('Let me show you how it works in real-time. Right now, on the left, our Admin is monitoring the global map. On the right, I am a civilian trapped in a new emergency.');
doc.moveDown(0.5);
doc.text('Watch what happens when I submit this incident report... (Click submit on the User side).', { oblique: true });
doc.moveDown(0.5);
doc.text('...Instantly, without the page even reloading, the Admin receives a tactical audio alert, the notification bell pulses red, and the new incident is dropped right onto the global map!');
doc.moveDown(1.5);

doc.fontSize(18).font('Helvetica-Bold').text('5. The Secret Sauce (AI Agents)');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('But here is what makes our project truly innovative. The Admin isn\'t just looking at data; they are being assisted by Autonomous AI Agents working behind the scenes.');
doc.moveDown(0.5);
doc.text('When that civilian reported the incident, our AI did three things:');
doc.list([
  'Assessed the severity and figured out exactly what resources were needed.',
  'Allocated available resources to the disaster automatically.',
  'Dynamic Replanning: If an ambulance breaks down on the way, our AI is smart enough to realize the failure and immediately re-plan by pulling a different resource to cover the gap.'
], { bulletRadius: 3 });
doc.moveDown(0.5);
doc.text('If the AI ever gets confused or resources run out, it flags the situation for the human Admin to make the final call.');
doc.moveDown(1.5);

doc.fontSize(18).font('Helvetica-Bold').text('6. The Conclusion');
doc.fontSize(12).font('Helvetica').moveDown(0.5);
doc.text('In summary, ECO-Crisis Command isn\'t just a map. It is a real-time, AI-driven lifeline that assesses, coordinates, and adapts to emergencies faster than humanly possible. Thank you!');

doc.end();
console.log('PDF Generated Successfully!');
