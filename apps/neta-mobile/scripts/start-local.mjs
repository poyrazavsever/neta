import { fileURLToPath } from 'node:url';

// Local native development must not require the Expo account API to serve a manifest.
process.env.EXPO_OFFLINE = '1';
const cli = new URL('../node_modules/expo/bin/cli', import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), 'start', '--dev-client', '--localhost', ...process.argv.slice(2)];
await import(cli.href);
