import { runCommandCOMPRESS } from './zip.js';

export async function runCommandDECOMPRESS(pathToFile, pathToDest) {
  await runCommandCOMPRESS(pathToFile, pathToDest, true);
}
