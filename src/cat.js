import { createReadStream } from 'node:fs';
import { util } from './utils.js';

export async function runCommandCAT(pathToFile) {
  const curDir = util.changePathView(process.cwd());
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  const readStream = createReadStream(pathToFile);
  let str = ``;
  for await (const chunk of readStream) str += chunk;
  console.log(`You are currently in ${curDir}\n${str}\n`);
}
