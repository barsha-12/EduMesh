const fs = require('fs');
const files = [
  'src/pages/Dashboard.jsx',
  'src/pages/Quiz.jsx',
  'src/pages/Feynman.jsx',
  'src/pages/Flashcards.jsx',
  'src/pages/AIChat.jsx',
  'src/pages/StudyNotes.jsx',
  'src/pages/Settings.jsx',
  'src/pages/KnowledgeGraph.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log(`Skipping ${f}`);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  // Special Gradients
  content = content.replace(/from-indigo-[0-9]{3} to-blue-[0-9]{3}/g, 'from-v-secondary to-[#87a5b3]');
  content = content.replace(/from-purple-[0-9]{3} to-pink-[0-9]{3}/g, 'from-v-primary to-v-accent');
  content = content.replace(/from-amber-[0-9]{3} to-orange-[0-9]{3}/g, 'from-v-accent to-v-primary');
  content = content.replace(/from-emerald-[0-9]{3} to-teal-[0-9]{3}/g, 'from-[#A0C2D2] to-[#D5E3E8]');
  content = content.replace(/from-\[\#A0C2D2\] to-purple-[0-9]{3}/g, 'from-[#A0C2D2] to-[#D5E3E8]');

  // Colors 
  content = content.replace(/indigo-[0-9]{3}/g, 'v-secondary');
  content = content.replace(/blue-[0-9]{3}/g, 'v-secondary');
  
  content = content.replace(/emerald-[0-9]{3}/g, 'v-secondary');
  content = content.replace(/teal-[0-9]{3}/g, 'v-info');
  
  content = content.replace(/amber-[0-9]{3}/g, 'v-primary');
  content = content.replace(/orange-[0-9]{3}/g, 'v-accent');
  
  content = content.replace(/rose-[0-9]{3}/g, 'v-primary');
  content = content.replace(/red-[0-9]{3}/g, 'v-primary');
  
  content = content.replace(/purple-[0-9]{3}/g, 'v-primary');

  fs.writeFileSync(f, content);
  console.log(`Updated ${f}`);
});
console.log('Color aesthetic restore complete!');
