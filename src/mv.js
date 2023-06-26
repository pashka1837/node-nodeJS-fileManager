import { rm } from 'node:fs/promises';
import { runCommandCP } from './cp.js';

export async function runCommandMV(pathToFile, pathToNewDir) {
  (await runCommandCP(pathToFile, pathToNewDir)) &&
    (await rm(pathToFile).catch(() => console.log(`Operation failed`)));
}
