import { rm } from 'node:fs/promises';
import { util } from './utils.js';

export async function runCommandRM(pathToFile) {
  const curDir = util.changePathView(process.cwd());
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  await rm(pathToFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}
