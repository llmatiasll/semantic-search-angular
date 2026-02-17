const fs = require('fs');
const path = require('path');

const distPath = 'dist/custom-element-search-angular/browser';
const staticPath = 'dist/static';

// Crear directorios
if (!fs.existsSync(`${staticPath}/js`)) {
  fs.mkdirSync(`${staticPath}/js`, { recursive: true });
}
if (!fs.existsSync(`${staticPath}/css`)) {
  fs.mkdirSync(`${staticPath}/css`, { recursive: true });
}

// Concatenar todos los JS
const jsFiles = fs.readdirSync(distPath)
  .filter(file => file.endsWith('.js'))
  .sort();

let concatenatedJs = '';
jsFiles.forEach(file => {
  console.log(`📦 Adding ${file}`);
  const content = fs.readFileSync(path.join(distPath, file), 'utf8');
  concatenatedJs += content + '\n';
});

fs.writeFileSync(`${staticPath}/js/semantic-search-bar.js`, concatenatedJs);
console.log('✅ JavaScript concatenated');

// Copiar CSS
const cssFiles = fs.readdirSync(distPath)
  .filter(file => file.endsWith('.css'));

if (cssFiles.length > 0) {
  let concatenatedCss = '';
  cssFiles.forEach(file => {
    console.log(`🎨 Adding ${file}`);
    const content = fs.readFileSync(path.join(distPath, file), 'utf8');
    concatenatedCss += content + '\n';
  });
  fs.writeFileSync(`${staticPath}/css/styles.css`, concatenatedCss);
  console.log('✅ CSS concatenated');
}

console.log('🎉 Build complete! Files ready in dist/static/');
