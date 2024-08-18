// Fixes an issue where you have to use the .js extension when importing a module
// This allows us to use imports without an extension when running
// the server with built code
// https://github.com/nodejs/node/issues/51196
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// https://github.com/olalonde/tsc-module-loader
register('tsc-module-loader', pathToFileURL('./'));
