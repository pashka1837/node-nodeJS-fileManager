import { rename } from 'node:fs/promises';
import { util } from './utils.js';

export async function runCommandRN(pathToOldFile, pathToNewFile) {
  const curDir = util.changePathView(process.cwd());
  if (!(await util.isExists(pathToOldFile)))
    return console.log(`Invalid input`);
  if (await util.isExists(pathToNewFile))
    return console.log(`File with this name is already exists`);
  await rename(pathToOldFile, pathToNewFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}
