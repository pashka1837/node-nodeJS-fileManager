import { appendFile } from 'node:fs/promises';
import { util } from './utils.js';

export async function runCommandADD(pathToFile) {
  const curDir = util.changePathView(process.cwd());
  if (await util.isExists(pathToFile))
    return console.log(`File already exists`);
  await appendFile(pathToFile, '')
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}
