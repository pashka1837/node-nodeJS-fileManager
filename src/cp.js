import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { util } from './utils.js';

export async function runCommandCP(pathToFile, pathToNewDir) {
  const curDir = util.changePathView(process.cwd());
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  if (!(await util.isDir(pathToNewDir))) return console.log(`Invalid input`);
  const fileName = pathToFile.split('/').pop();
  if (await util.isFile(`${pathToNewDir}/${fileName}`))
    return console.log(`File with this name is already exists`);
  try {
    await pipeline(
      createReadStream(pathToFile),
      createWriteStream(`${pathToNewDir}/${fileName}`)
    );
    console.log(`You are currently in ${curDir}`);
    return true;
  } catch {
    console.log(`Operation failed`);
    return false;
  }
}
