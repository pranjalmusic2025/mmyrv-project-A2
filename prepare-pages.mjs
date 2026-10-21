import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const distributionDirectory = resolve(repositoryRoot, 'QA', 'dist');
const sourceAssets = resolve(distributionDirectory, 'assets');
const outputAssets = resolve(repositoryRoot, 'assets');
const basePath = '/mmyrv-project-A2/';

const [html, assetFiles] = await Promise.all([
  readFile(resolve(distributionDirectory, 'index.html'), 'utf8'),
  readdir(sourceAssets),
]);

const appBundleName = assetFiles.find((name) => /^index-.*\.js$/.test(name));
if (!appBundleName) {
  throw new Error('Could not find the compiled application bundle in QA/dist/assets.');
}

const appBundlePath = resolve(sourceAssets, appBundleName);
const appBundle = await readFile(appBundlePath, 'utf8');
const routerMarker = 'e.jsx(ns,{children:e.jsxs(ia,{children:';
if (appBundle.split(routerMarker).length !== 2) {
  throw new Error('The compiled router marker changed; refusing to patch the bundle.');
}

const deploymentHtml = html
  .replace(/<link rel="icon"[^>]*>\s*/i, '')
  .replace(/(["'])\/assets\//g, (_, quote) => `${quote}${basePath}assets/`);
const deploymentBundle = appBundle.replace(
  routerMarker,
  `e.jsx(ns,{basename:"${basePath.slice(0, -1)}",children:e.jsxs(ia,{children:`,
);

await mkdir(outputAssets, { recursive: true });
await cp(sourceAssets, outputAssets, { recursive: true });
await writeFile(resolve(outputAssets, appBundleName), deploymentBundle);
await writeFile(resolve(repositoryRoot, 'index.html'), deploymentHtml);
await writeFile(resolve(repositoryRoot, '404.html'), deploymentHtml);

console.log('Prepared GitHub Pages files at the repository root.');
