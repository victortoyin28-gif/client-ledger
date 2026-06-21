/* Client Ledger - Main Logic */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Client Ledger] App initialized');
  document.getElementById('app').innerHTML = `
    <h1>Client Ledger</h1>
    <p>App is live ✅</p>
  `;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
});
EOFsed -i 's/manifest.js/manifest.json/' app.html
grep -q 'id="app"' app.html || sed -i 's/<body>/<body>\n  <div id="app"><\/div>/' app.html
grep -q 'style.css' app.html || sed -i 's/<\/head>/<link rel="stylesheet" href="style.css">\n<\/head>/' app.html
grep -q 'script.js' app.html || sed -i 's/<\/body>/<script src="script.js"><\/script>\n<\/body>/' app.html

git add style.css script.js app.html
git commit -m "feat: scaffold missing assets and fix blank page"
git push origin main
