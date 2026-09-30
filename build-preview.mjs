import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const css = await readFile(new URL('src/styles.css', root), 'utf8');
const files = ['data.js', 'filters.js', 'activity.js', 'storage.js', 'main.js'];
const sources = await Promise.all(files.map(async name => {
  const source = await readFile(new URL(`src/${name}`, root), 'utf8');
  return `// ${name}\n` + source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
}));
const bundle = sources.join('\n\n');
if (/<\/script/i.test(bundle) || /<\/style/i.test(css)) throw new Error('Unsafe embedded closing tag');
const preview = html.replace('<link rel="stylesheet" href="./src/styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="./src/main.js"></script>', () => `<script type="module">\n${bundle}\n</script>`);
await writeFile(new URL('preview.html', root), preview);
console.log('Built preview.html from the same source modules. Open it directly for an offline preview.');
