/**
 * Creates a minimal static "out" folder for Firebase Hosting deploy.
 * Use this when the full Next.js app (with API routes) cannot be statically exported.
 * For the full app with API routes, use Firebase App Hosting or another solution.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');
const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ToernooiProf</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; color: #1e293b; }
    h1 { color: #166534; }
    p { line-height: 1.6; }
    a { color: #15803d; }
  </style>
</head>
<body>
  <h1>ToernooiProf</h1>
  <p>Deze statische pagina is alleen bedoeld voor Firebase Hosting-configuratie.</p>
  <p>De volledige app (met inloggen, API’s en scoreborden) kan niet als statische export worden gehost. Gebruik <strong>Firebase App Hosting</strong> (Next.js) of een andere hostingoplossing voor de complete applicatie.</p>
</body>
</html>
`;

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log('Created out/index.html for Firebase Hosting.');
