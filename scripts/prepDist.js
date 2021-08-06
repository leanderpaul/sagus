/**
 * This utility script is called when building spark, to make sure the "dist" directory is prepared for publishing.
 *
 * This script will:
 *    - Copy the current root package.json into "dist" after adjusting it for publishing.
 *    - Copy the supporting files from the root into "dist" (e.g. `README.MD`, `LICENSE`, etc.).
 *
 */
const fs = require('fs');

const packageJson = require('../package.json');

const srcDir = `${__dirname}/..`;
const distDir = `${__dirname}/../dist`;

/**
 * The root package.json is marked as private to prevent publishing from happening in the root of the project.
 * This sets the package back to public so it can be published from the "dist" directory.
 */
packageJson.private = false;
packageJson.main = 'index.js';
packageJson.types = 'index.d.ts';

/** Remove package.json items that we don't need to publish */
delete packageJson.scripts;

/** Save the modified package.json to "dist" */
const distPackageJson = JSON.stringify(packageJson, null, 2);
fs.writeFileSync(`${distDir}/package.json`, distPackageJson);

/** Copy supporting files into "dist" */
fs.copyFileSync(`${srcDir}/README.md`, `${distDir}/README.md`);
fs.copyFileSync(`${srcDir}/LICENSE`, `${distDir}/LICENSE`);
