const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function findFiles() {
  const browserDir = 'dist/custom-element-search-angular/browser';

  if (!fs.existsSync(browserDir)) {
    throw new Error(`Directory not found: ${browserDir}`);
  }

  const files = fs.readdirSync(browserDir);

  const mainFile = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
  const polyfillsFile = files.find(f => f.startsWith('polyfills-') && f.endsWith('.js'));
  const stylesFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

  if (!mainFile) {
    console.error('Available files:', files);
    throw new Error('Could not find main-*.js file');
  }

  return {
    main: path.join(browserDir, mainFile),
    polyfills: polyfillsFile ? path.join(browserDir, polyfillsFile) : null,
    styles: stylesFile ? path.join(browserDir, stylesFile) : null
  };
}

async function build() {
  try {
    const foundFiles = await findFiles();
    console.log(`📦 Found files:`);
    console.log(`   Main: ${foundFiles.main}`);
    if (foundFiles.polyfills) console.log(`   Polyfills: ${foundFiles.polyfills}`);
    if (foundFiles.styles) console.log(`   Styles: ${foundFiles.styles}`);

    // Crear directorios de salida
    const outputJsDir = 'dist/static/js';
    const outputCssDir = 'dist/static/css';

    if (!fs.existsSync(outputJsDir)) {
      fs.mkdirSync(outputJsDir, { recursive: true });
    }
    if (!fs.existsSync(outputCssDir)) {
      fs.mkdirSync(outputCssDir, { recursive: true });
    }

    // Estrategia: Procesar solo main.js con bundle, que ya incluye todo
    console.log('\n🔨 Building JavaScript bundle...');

    await esbuild.build({
      entryPoints: [foundFiles.main],
      bundle: true,
      format: 'iife',
      globalName: 'SemanticSearchApp',
      outfile: 'dist/static/js/semantic-search-bar.js',
      minify: true,
      target: ['es2015'],
      platform: 'browser',
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      // Incluir polyfills en el bundle
      inject: foundFiles.polyfills ? [foundFiles.polyfills] : []
    });

    console.log('✅ JavaScript bundle completed!');

    // Copiar CSS
    if (foundFiles.styles) {
      const cssContent = fs.readFileSync(foundFiles.styles, 'utf8');
      fs.writeFileSync('dist/static/css/styles.css', cssContent);
      console.log('✅ CSS copied!');
    } else {
      fs.writeFileSync('dist/static/css/styles.css', '/* Styles included in JS */');
      console.log('⚠️  No CSS file found, creating placeholder');
    }

    // Mostrar tamaños
    const jsStats = fs.statSync('dist/static/js/semantic-search-bar.js');
    console.log(`\n📊 Output sizes:`);
    console.log(`   JS: ${(jsStats.size / 1024).toFixed(2)} KB`);

    if (foundFiles.styles) {
      const cssStats = fs.statSync('dist/static/css/styles.css');
      console.log(`   CSS: ${(cssStats.size / 1024).toFixed(2)} KB`);
    }

    console.log('\n🎉 Build complete! Files ready in dist/static/');

  } catch (error) {
    console.error('❌ Build failed:', error);
    if (error.errors) {
      error.errors.forEach(err => console.error(err));
    }
    process.exit(1);
  }
}

build();
